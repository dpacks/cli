var result = require('@dpack/logger/result')
var stringKey = require('@dwebs/codec').toStr
var pretty = require('prettier-bytes')
var chalk = require('chalk')

module.exports = statusUI

function statusUI (state) {
  if (!state.dpack) return 'Starting dPack program...'

  var dpack = state.dpack
  var stats = dpack.stats.get()

  return result(`
    ${chalk.blue('dweb://' + stringKey(dpack.key))}
    ${stats.files} files (${pretty(stats.byteLength)})
    Version: ${chalk.bold(stats.version)}
  `)
}
