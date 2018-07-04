var result = require('@dpack/logger/result')
var pretty = require('prettier-bytes')
var chalk = require('chalk')
var importUI = require('./components/import-progress')
var keyEl = require('./elements/key')
var pluralize = require('./elements/pluralize')

module.exports = createUI

function createUI (state) {
  if (!state.dpack) {
    return result(`
    Creating a dPack! Add information to your dpack.json file:
  `)
  }

  var dpack = state.dpack
  var stats = dpack.stats.get()
  var title = '\n'
  var progressView
  var exitMsg = `
    Your dPack is created! Run ${chalk.green('dpack dweb')} to distribute:
    ${keyEl(dpack.key)}
  `
  if (!state.opts.import) {
    // set exiting right away
    state.exiting = true
  }

  if (!state.exiting) {
    // Only show key if not about to exit
    title = `${keyEl(dpack.key)}\n`
  }
  if (state.title) title += state.title

  if (stats.version > 0) title += `: ${stats.files} ${pluralize('file', stats.files)} (${pretty(stats.byteLength)})`
  else if (stats.version === 0) title += ': (empty vault)'

  if (state.opts.import) {
    progressView = importUI(state) + '\n'
  } else {
    progressView = 'Not importing files.'
  }

  return result(`
    ${title}

    ${progressView}
    ${state.exiting ? exitMsg : chalk.dim('Ctrl+C to Exit')}
  `)
}
