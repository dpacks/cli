module.exports = {
  name: 'dist',
  command: dist,
  help: [
    'Create and distribute a dPack',
    'Create a dPack, import files, and distribute to the dWeb network.',
    '',
    'Usage: dpack dist'
  ].join('\n'),
  options: [
    {
      name: 'import',
      boolean: true,
      default: true,
      help: 'Import files from the directory to the database.'
    },
    {
      name: 'ignoreHidden',
      boolean: true,
      default: true,
      abbr: 'ignore-hidden'
    },
    {
      name: 'watch',
      boolean: true,
      default: true,
      help: 'Watch for changes and import updated files.'
    }
  ]
}

function dist (opts) {
  var DPack = require('@dpack/core')
  var dPackLogger = require('@dpack/logger')
  var vaultUI = require('../ui/vault')
  var trackVault = require('./lib/vault')
  var onExit = require('./lib/exit')
  var parseArgs = require('../parse-args')
  var debug = require('debug')('dpack')

  if (!opts.dir) {
    opts.dir = parseArgs(opts).dir || process.cwd()
  }

  debug('Distributing vault', opts)

  var views = [vaultUI]
  var dPackEntry = dPackLogger(views, { dlogpace: opts.dlogpace, quiet: opts.quiet, debug: opts.debug })
  dPackEntry.use(trackVault)
  dPackEntry.use(onExit)
  dPackEntry.use(function (state, bus) {
    state.opts = opts

    DPack(opts.dir, opts, function (err, dpack) {
      if (err && err.name === 'IncompatibleError') return bus.emit('exit:warn', 'Directory contains incompatible dPack metadata. Please remove your old .dpack folder (rm -rf .dpack)')
      else if (err) return bus.emit('exit:error', err)
      if (!dpack.writable && !opts.shortcut) return bus.emit('exit:warn', 'Vault not writable, cannot use dist. Please use sync to resume download.')

      state.dpack = dpack
      bus.emit('dpack')
      bus.emit('render')
    })
  })
}
