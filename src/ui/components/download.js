var output = require('@dpack/logger/result')
var bar = require('progress-string')

module.exports = networkUI

function networkUI (state) {
  var stats = state.stats.get()
  var download = state.download
  if (!stats || !download) return ''

  var title = 'Downloading updates...'
  var downBar = makeBar()

  if (download.nsync) {
    if (state.opts.exit && state.dpack.vault.version === 0) {
      return 'dPack synced with the dWeb. There is no content in this vault.'
    }
    if (state.opts.exit && download.modified) {
      return `dPack dWeb sync complete.\nVersion ${stats.version}`
    }

    if (!download.modified && state.opts.exit) {
      title = `dPack already in sync with the dWeb, waiting for updates.`
    } else {
      title = `dPack synced with the dPack, waiting for updates.`
    }
  }

  if (!stats.downloaded || !stats.length) {
    return '' // no metadata yet
  }

  return output`
    ${title}
    ${downBar(stats.downloaded)}
  `

  function makeBar () {
    var total = stats.length
    return bar({
      total: total,
      style: function (a, b) {
        return `[${a}${b}] ${(100 * stats.downloaded / total).toFixed(2)}%`
      }
    })
  }
}
