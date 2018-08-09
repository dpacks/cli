module.exports = {
  name: 'status',
  command: status,
  help: [
    'Get information on about the dPack in a directory.',
    '',
    'Usage: dweb status'
  ].join('\n'),
  options: []
}

function status (opts) {
  var DWeb = require('@dpack/core')
  var dPackLogger = require('@dpack/logger')
  var statusUI = require('../ui/status')
  var onExit = require('./lib/exit')
  var parseArgs = require('../parse-args')
  var debug = require('debug')('dpack')

  debug('dweb status')
  if (!opts.dir) {
    opts.dir = parseArgs(opts).dir || process.cwd()
  }
  opts.createIfMissing = false // sync must always be a resumed vault

  var dPackEntry = dPackLogger(statusUI, { dlogpace: opts.dlogpace, quiet: opts.quiet, debug: opts.debug })
  dPackEntry.use(onExit)
  dPackEntry.use(function (state, bus) {
    state.opts = opts

    DWeb(opts.dir, opts, function (err, dweb) {
      if (err && err.name === 'MissingError') return bus.emit('exit:warn', 'Sorry, could not find a dPack in this directory.')
      if (err) return bus.emit('exit:error', err)

      state.dweb = dweb
      var stats = dweb.trackStats()
      if (stats.get().version === dweb.version) return exit()
      stats.on('update', function () {
        if (stats.get().version === dweb.version) return exit()
      })

      function exit () {
        bus.render()
        process.exit(0)
      }
    })
  })
}
