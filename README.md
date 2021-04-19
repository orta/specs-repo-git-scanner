### Checks the CP Specs Git

You need node 15, and then:

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
