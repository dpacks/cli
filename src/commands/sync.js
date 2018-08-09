module.exports = {
  name: 'sync',
  command: sync,
  help: [
    'Sync a dPack vault with the distributed web',
    'Watch and import file changes (if vault is writable)',
    '',
    'Usage: dweb sync'
  ].join('\n'),
  options: [
    {
      name: 'import',
      boolean: true,
      default: true,
      help: 'Import files from the directory to the database (dPack Writable).'
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
      default: '.dwebdownload',
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
      help: 'Print out the dPack key (dPack Not Writable).'
    }
  ]
}

function sync (opts) {
  var DWeb = require('@dpack/core')
  var dPackLogger = require('@dpack/logger')
  var vaultUI = require('../ui/vault')
  var selectiveSync = require('./lib/selective-sync')
  var trackVault = require('./lib/vault')
  var onExit = require('./lib/exit')
  var parseArgs = require('../parse-args')
  var debug = require('debug')('dpack')

  debug('dweb sync')
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
    DWeb(opts.dir, opts, function (err, dweb) {
      if (err && err.name === 'MissingError') return bus.emit('exit:warn', 'No existing vault in this directory.')
      if (err) return bus.emit('exit:error', err)

      state.dweb = dweb
      bus.emit('dweb')
      bus.emit('render')
    })
  })
}
