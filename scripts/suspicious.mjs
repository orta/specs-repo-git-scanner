// @ts-check

import nodeGit from "nodegit"
import fs from "fs"
import sus from "../suspicious.json"
import v from "../verified.json"

import pkg from 'readline-sync';
import { execSync } from "child_process";
const { keyInYN } = pkg;

const repoWD = "/Users/ortatherox/.cocoapods/repos/master"

const addToVerified = (sha) => {
  const v = JSON.parse(fs.readFileSync("verified.json", "utf8"))
  v.verified.push(sha)
  fs.writeFileSync("verified.json", JSON.stringify(v))
}

const go = async () => {
  sus.sus.forEach(s => {
    // Skip seen commits
    if (v.verified.includes(s.sha)) return
    
    console.clear()
    const diff = execSync(`git show ${s.sha}`, { cwd: repoWD })
    console.log(diff.toString())
    const ok = keyInYN("Is this OK?")
    if (ok) addToVerified(s.sha)
    else process.exit()
  })
}
go()
