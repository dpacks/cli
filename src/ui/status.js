var result = require('@dpack/logger/result')
var stringKey = require('@dwebs/codec').toStr
var pretty = require('prettier-bytes')
var chalk = require('chalk')

module.exports = statusUI

function statusUI (state) {
  if (!state.dweb) return 'Starting dPack program...'

  var dweb = state.dweb
  var stats = dweb.stats.get()

  return result(`
    ${chalk.blue('dweb://' + stringKey(dweb.key))}
    ${stats.files} files (${pretty(stats.byteLength)})
    Version: ${chalk.bold(stats.version)}
  `)
}
