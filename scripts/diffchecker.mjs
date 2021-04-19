// @ts-check

import nodeGit from "nodegit"
import fs from "fs"
import diffs from "../checkdiffs.json"

const repoWD = "/Users/ortatherox/.cocoapods/repos/master"

const go = async () => {
  const repo = await nodeGit.Repository.open(repoWD)
  diffs.shas.forEach(async sha => {
    const commit = await repo.getCommit(sha.sha)
    const diffs = await commit.getDiff()

    const sus = (reason) => {
      process.stdout.write("\x1b[91mx\x1b[39m")
    }

    if (sha.type === "add") {
      if (diffs.length !== 1) sus("Adds are 1 file")
      const diff = diffs[0]
      const p = diff.patches()
    }
    
  });
}
go()
