const fs = require('fs')
const path = require('path')
const runYarnLock = 'yarn install --frozen-lockfile'
const isBranchCheckout = `$HUSKY_GIT_PARAMS =~ 1$`

const hooks = {
  'pre-commit': 'lint-staged',
  'post-checkout': `if [[ ${isBranchCheckout} ]]; then ${runYarnLock}; fi`,
  'post-merge': runYarnLock,
}

try {
  const ignoreList = (fs.readFileSync(path.resolve('.huskyignore'), 'utf8') || '').split('\n').filter((v) => !!v)
  ignoreList.forEach((ignore) => delete hooks[ignore])
} catch (error) {}

module.exports = {
  hooks,
}
