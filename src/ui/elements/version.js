var chalk = require('chalk')

module.exports = function (version) {
  return `${chalk.green(`dpack v${version}`)}`
}
