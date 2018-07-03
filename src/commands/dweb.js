module.exports = {
  name: 'dweb',
  command: dweb,
  help: [
    'Sync a DPack vault with the dWeb network',
    'Watch and import file changes (if vault is writable)',
    '',
    'Usage: dpack dweb'
  ].join('\n'),
  options: [
    {
      name: 'import',
      boolean: true,
      default: true,
      help: 'Import files from the directory to the database (DPack Writable).'
    },
    {
      name: 'ignoreHidden',
      boolean: true,
      default: true,
      abbr: 'ignore-hidden'
    },
    {
      name: 'selectFromFile',
      boolean: false,
      default: '.dpackdownload',
      help: 'Sync only the list of selected files or directories in the given file.',
      abbr: 'select-from-file'
    },
    {
      name: 'select',
      boolean: false,
      default: false,
      help: 'Sync only the list of selected files or directories.'
    },
    {
      name: 'watch',
      boolean: true,
      default: true,
      help: 'Watch for changes and import updated files (dPack Writable).'
    },
    {
      name: 'show-key',
      boolean: true,
      default: false,
      abbr: 'k',
      help: 'Print out the dPack key (DPack Not Writable).'
    }
  ]
}

function dweb (opts) {
  var DPack = require('@dpack/core')
  var dPackLogger = require('@dpack/logger')
  var vaultUI = require('../ui/vault')
  var selectiveSync = require('./lib/selective-sync')
  var trackVault = require('./lib/vault')
  var onExit = require('./lib/exit')
  var parseArgs = require('../parse-args')
  var debug = require('debug')('dpack')

  debug('dpack dweb')
  var parsed = parseArgs(opts)
  opts.key = parsed.key
  opts.dir = parsed.dir || process.cwd()
  opts.showKey = opts['show-key'] // using abbr in option makes printed help confusing

  // Force options
  opts.createIfMissing = false // sync must always be a resumed vault
  opts.exit = false

  var dPackEntry = dPackLogger(vaultUI, { dlogpace: opts.dlogpace, quiet: opts.quiet, debug: opts.debug })
  dPackEntry.use(trackVault)
  dPackEntry.use(onExit)
  dPackEntry.use(function (state, bus) {
    state.opts = opts
    selectiveSync(state, opts)
    DPack(opts.dir, opts, function (err, dpack) {
      if (err && err.name === 'MissingError') return bus.emit('exit:warn', 'No existing vault in this directory.')
      if (err) return bus.emit('exit:error', err)

      state.dpack = dpack
      bus.emit('dpack')
      bus.emit('render')
    })
  })
}
