// @ts-check

import nodeGit from "nodegit"
import fs from "fs"
import v from "../verified.json"

const repoWD = "/Users/ortatherox/.cocoapods/repos/master"
const repoBotEmail = "eloy.de.enige+cocoapods.github.bot@gmail.com"
const verified = v.verified

const shas = []
const suspicious = []

const go = async () => {
  const repo = await nodeGit.Repository.open(repoWD)
  const master = await repo.getMasterCommit()
  const history = master.history();

  // Listen for commit events from the history.
  history.on("commit", async function (_c) {
    /** @type {import("nodegit").Commit } */
    const commit = _c
    if (commit.date().getFullYear() < 2015) return

    if (shas.length % 100 === 0) process.stdout.write(".")

    const sus = (reason) => {
      const sha = commit.sha()
      if (verified.includes(sha)) return
      suspicious.push({ sha, reason })
      process.stdout.write("\x1b[91mx\x1b[39m")
      
    }

    // Store the author object.
    const author = commit.author();
    const committer = commit.committer()

    if (!author || !author.email()) sus("No author")

    let type = "suspicious"
    const isAdd = commit.message().startsWith("[Add]")
    if (isAdd) type = "add"
    const isDel = commit.message().startsWith("[Delete]")
    if (isDel) type = "del"
    const isDeprecate = commit.message().startsWith("[Deprecate]")
    if (isDeprecate) type = "deprecate" // 4adf44eb9d88db0a69ab09758c225161fc9c78d5
    const isRelease = commit.message().includes("CocoaPods release")
    if (isRelease) type = "release" // a89f3dca55828c2a8a3d263ad98e9a75f841ee40

    if (type === "suspicious") sus("Unknown type of commit")
    shas.push({ sha: commit.sha(), type })

    const isAutomated = isAdd || isDel || isDeprecate
    if (isAutomated) {
      if (!committer || committer.email() !== repoBotEmail) sus("Wrong committer")
    }
  });

  // Start emitting events.
  history.start();
}


async function exitHandler(options, exitCode) {
  if (options.exit) process.exit()
  
  fs.writeFileSync("suspicious.json", JSON.stringify({ sus: suspicious }))
  fs.writeFileSync("checkdiffs.json", JSON.stringify({ shas }))
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

go()

