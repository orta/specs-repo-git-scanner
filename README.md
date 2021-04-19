### Checks the CP Specs Git

This repo will take your existing Specs repo and start to look through the commits for anything suspicious. There
are 4 types of automated commits, which make up the vast majority of the ~500,000 commits since 2015

- Add a Podspec (`pod trunk push`)
- Deprecate a podspec (`pod trunk deprecate`)
- Remove a podspec (`pod trunk delete`)
- Update the CocoaPods version (admin)

There are three steps to this repo:

- `yarn scan` - go through the history of the master branch, checking commit metadata and creating both `checkdiffs.json` and `suspicious.json`
- `yarn diffs` - go through `checkdiffs.json` and validate the diff for the 4 possible types above
- `yarn suspicious` - Loop through all possible suspicious shas, show `git show [sha]` and ask the user whether it is OK

### To run locally

```
git clone https://github.com/orta/specs-repo-git-scanner
cd specs-repo-git-scanner
yarn

# Scan all commits for suspicious metadata
yarn scan

# Scan all commits for suspicious diffs
yarn diffs

# Manually verify all commits which don't match
yarn suspicious
```
