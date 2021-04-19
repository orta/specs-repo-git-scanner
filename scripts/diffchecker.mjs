// @ts-check
import nodeGit from "nodegit"
import fs from "fs"

const repoWD = "/Users/ortatherox/.cocoapods/repos/master"

const onlyRun = undefined //"release" // undefined

const go = async () => {
  const checkdiffs = JSON.parse(fs.readFileSync("checkdiffs.json", "utf8"))
  console.log(`This is the slow one, there are ${checkdiffs.shas.length} diffs to read.`)
  console.log("An x will appear every 10 commits")
  
  const repo = await nodeGit.Repository.open(repoWD)
  for (const sha of checkdiffs.shas) {
    const index = checkdiffs.shas.indexOf(sha)
    if (index % 10 === 0) process.stdout.write(".")

    if (onlyRun && sha.type !== onlyRun) continue
    const commit = await repo.getCommit(sha.sha)
    const diffs = await commit.getDiff()

    const sus = (reason) => {
      process.stdout.write("\x1b[91mx\x1b[39m")
      throw new Error(reason)
    }

    if (sha.type === "add") {
      if (diffs.length !== 1) sus("Adds are 1 file")
      const diff = diffs[0]
      const p = await diff.patches()
      if (diffs.length !== 1) sus("Adds have 1 patch")
      const patch = p[0]

      if (!patch.isAdded()) sus("Adds should be an add of a single new file")
    }

    if (sha.type === "del") {
      if (diffs.length !== 1) sus("Dels are 1 file")
      const diff = diffs[0]
      const p = await diff.patches()
      if (diffs.length !== 1) sus("Dels have 1 patch")
      const patch = p[0]

      if (!patch.isDeleted()) sus("Dels should be only a delete of a single file")
    }
    
    if (sha.type === "deprecate") {
      if (diffs.length !== 1) sus("Deprecates are 1 file")
      const diff = diffs[0]
      const p = await diff.patches()
      if (diffs.length !== 1) sus("Deprecates have 1 patch")
      const patch = p[0]

      if (!patch.isModified()) sus("Deprecates should only be a modify on one file")
      const stats = patch.lineStats()
      if (stats.total_context !== 4 || stats.total_additions!== 2 || stats.total_deletions !== 2) sus("Deprecates should add 2 files and delete 1")
    }

    if (sha.type === "release") {
      if (diffs.length !== 1) sus("Releases are 1 file")
      const diff = diffs[0]
      const p = await diff.patches()
      if (diffs.length !== 1) sus("Releases have 1 patch")
      const patch = p[0]

      if (!patch.isModified()) sus("Releases should only be a modify on one file")
      const path = patch.newFile().path()
      if (path !== 'CocoaPods-version.yml') sus("Releases should only edit the root yml file")
    }
  };
}
go()
