var path = require('path')
var result = require('@dpack/logger/result')
var pretty = require('prettier-bytes')
var chalk = require('chalk')
var downloadUI = require('./components/download')
var importUI = require('./components/import-progress')
var warningsUI = require('./components/warnings')
var networkUI = require('./components/network')
var sourcesUI = require('./components/sources')
var keyEl = require('./elements/key')
var pluralize = require('./elements/pluralize')
var version = require('./elements/version')
var pkg = require('../../package.json')

module.exports = vaultUI

function vaultUI (state) {
  if (!state.dpack) return 'Starting dPack program...'
  if (!state.writable && !state.hasContent) return 'Connecting to dPack network...'
  if (!state.warnings) state.warnings = []

  var dpack = state.dpack
  var stats = dpack.stats.get()
  var title = (state.dpack.resumed) ? '' : `Created new dPack in ${dpack.path}${path.sep}.dpack\n`
  var progressView

  if (state.writable || state.opts.showKey) {
    title += `${keyEl(dpack.key)}\n`
  }
  if (state.title) title += state.title
  else if (state.writable) title += 'Distributing dPack'
  else title += 'Downloading dPack'
  if (state.opts.thin) title += `: ${state.opts.selectedFiles.length} ${pluralize('file', state.opts.selectedFiles.length)} (${pretty(state.selectedByteLength)})`
  else if (stats.version > 0) title += `: ${stats.files} ${pluralize('file', stats.file)} (${pretty(stats.byteLength)})`
  else if (stats.version === 0) title += ': (empty vault)'
  if (state.http && state.http.listening) title += `\nServing files over http at http://localhost:${state.http.port}`

  if (!state.writable) {
    progressView = downloadUI(state)
  } else {
    if (state.opts.import) {
      progressView = importUI(state)
    } else {
      progressView = 'Not importing files.' // TODO: ?
    }
  }

  return result(`
    ${version(pkg.version)}
    ${title}
    ${state.joinNetwork ? '\n' + networkUI(state) : ''}
    ${progressView}
    ${state.opts.sources ? sourcesUI(state) : ''}
    ${state.warnings ? warningsUI(state) : ''}
    ${state.exiting ? 'Exiting the dPack program...' : chalk.dim('Ctrl+C to Exit')}
  `)
}
