var debug = require('debug')('dpack')
var xtend = Object.assign

module.exports = trackDownload

function trackDownload (state, bus) {
  if (state.hasContent) return track()
  bus.once('vault:content', track)

  function track () {
    var vault = state.dweb.vault

    state.download = xtend({
      modified: false,
      nsync: false
    }, {})

    vault.content.on('clear', function () {
      debug('vault clear')
      state.download.modified = true
    })

    vault.content.on('download', function (index, data) {
      state.download.modified = true
    })

    vault.on('syncing', function () {
      debug('vault syncing')
      state.download.nsync = false
    })

    vault.on('sync', function () {
      debug('vault sync', state.stats.get())
      state.download.nsync = true
      var shouldExit = (state.download.modified && state.opts.exit)
      if (shouldExit) return exit()
      if (state.dweb.vault.version === 0) {
        // TODO: deal with this.
        // Sync sometimes fires early when it should wait for update.
      }
      bus.emit('render')
    })

    vault.on('update', function () {
      debug('vault update')
      bus.emit('render')
    })

    function exit () {
      if (state.stats.get().version !== vault.version) {
        return state.stats.on('update', exit)
      }
      state.exiting = true
      bus.render()
      process.exit(0)
    }
  }
}
