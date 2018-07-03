module.exports = {
  name: 'status',
  command: status,
  help: [
    'Get information on about the dPack in a directory.',
    '',
    'Usage: dpack status'
  ].join('\n'),
  options: []
}

function status (opts) {
  var DPack = require('@dpack/core')
  var dPackLogger = require('@dpack/logger')
  var statusUI = require('../ui/status')
  var onExit = require('./lib/exit')
  var parseArgs = require('../parse-args')
  var debug = require('debug')('dpack')

  debug('dpack status')
  if (!opts.dir) {
    opts.dir = parseArgs(opts).dir || process.cwd()
  }
  opts.createIfMissing = false // sync must always be a resumed vault

  var dPackEntry = dPackLogger(statusUI, { dlogpace: opts.dlogpace, quiet: opts.quiet, debug: opts.debug })
  dPackEntry.use(onExit)
  dPackEntry.use(function (state, bus) {
    state.opts = opts

    DPack(opts.dir, opts, function (err, dpack) {
      if (err && err.name === 'MissingError') return bus.emit('exit:warn', 'Sorry, could not find a dPack in this directory.')
      if (err) return bus.emit('exit:error', err)

      state.dpack = dpack
      var stats = dpack.trackStats()
      if (stats.get().version === dpack.version) return exit()
      stats.on('update', function () {
        if (stats.get().version === dpack.version) return exit()
      })

      function exit () {
        bus.render()
        process.exit(0)
      }
    })
  })
}
