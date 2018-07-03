module.exports = {
  name: 'fork',
  command: fork,
  help: [
    'Clone a remote dPack vault',
    '',
    'Usage: dpack fork <link> [download-folder]'
  ].join('\n'),
  options: [
    {
      name: 'empty',
      boolean: false,
      default: false,
      help: 'Do not download files by default. Files must be synced manually.'
    },
    {
      name: 'upload',
      boolean: true,
      default: true,
      help: 'announce your address on link (improves connection capability) and upload data to other downloaders.'
    },
    {
      name: 'show-key',
      boolean: true,
      default: false,
      abbr: 'k',
      help: 'print out the dPack key'
    }
  ]
}

function fork (opts) {
  var fs = require('fs')
  var path = require('path')
  var rimraf = require('rimraf')
  var DPack = require('@dpack/core')
  var linkResolve = require('@dwebs/resolve')
  var dPackLogger = require('@dpack/logger')
  var vaultUI = require('../ui/vault')
  var trackVault = require('./lib/vault')
  var revelationExit = require('./lib/revelation-exit')
  var onExit = require('./lib/exit')
  var parseArgs = require('../parse-args')
  var debug = require('debug')('dpack')

  var parsed = parseArgs(opts)
  opts.key = parsed.key || opts._[0] // pass other links to resolver
  opts.dir = parsed.dir
  opts.showKey = opts['show-key'] // using abbr in option makes printed help confusing
  opts.thin = opts.empty

  debug('fork()')

  // cmd: dpack /path/to/dpack.json (opts.key is path to dpack.json)
  if (fs.existsSync(opts.key)) {
    try {
      opts.key = getDPackJsonKey()
    } catch (e) {
      debug('error reading dpack.json key', e)
    }
  }

  debug(Object.assign({}, opts, {key: '<private>', _: null})) // don't show key

  var dPackEntry = dPackLogger(vaultUI, { dlogpace: opts.dlogpace, quiet: opts.quiet, debug: opts.debug })
  dPackEntry.use(trackVault)
  dPackEntry.use(revelationExit)
  dPackEntry.use(onExit)
  dPackEntry.use(function (state, bus) {
    if (!opts.key) return bus.emit('exit:warn', 'key required to fork')

    state.opts = opts
    var createdDirectory = null // so we can delete directory if we get error

    // Force these options for fork command
    opts.exit = (opts.exit !== false)
    // opts.errorIfExists = true // TODO: do we want to force this?

    linkResolve(opts.key, function (err, key) {
      if (err && err.message.indexOf('Invalid key') === -1) return bus.emit('exit:error', 'Could not resolve link')
      else if (err) return bus.emit('exit:warn', 'Link is not a valid DPack link.')

      opts.key = key
      createDir(opts.key, function () {
        bus.emit('key', key)
        runDPack()
      })
    })

    function createDir (key, cb) {
      debug('Checking directory for fork')
      // Create the directory if it doesn't exist
      // If no dir is specified, we put dpack in a dir with name = key
      if (!opts.dir) opts.dir = key
      if (!Buffer.isBuffer(opts.dir) && typeof opts.dir !== 'string') {
        return bus.emit('exit:error', 'Directory path must be a string or Buffer')
      }
      fs.access(opts.dir, fs.F_OK, function (err) {
        if (!err) {
          createdDirectory = false
          return cb()
        }
        debug('No existing directory, creating it.')
        createdDirectory = true
        fs.mkdir(opts.dir, cb)
      })
    }

    function runDPack () {
      DPack(opts.dir, opts, function (err, dpack) {
        if (err && err.name === 'ExistsError') return bus.emit('exit:warn', 'Existing vault in this directory. Use pull or sync to update.')
        if (err) {
          if (createdDirectory) rimraf.sync(dpack.path)
          return bus.emit('exit:error', err)
        }
        if (dpack.writable) return bus.emit('exit:warn', 'Vault is writable. Cannot fork your own vault =).')

        state.dpack = dpack
        state.title = 'Cloning'
        bus.emit('dpack')
        bus.emit('render')
      })
    }
  })

  function getDPackJsonKey () {
    var dpackPath = opts.key
    var stat = fs.lstatSync(dpackPath)

    if (stat.isDirectory()) dpackPath = path.join(dpackPath, 'dpack.json')

    if (!fs.existsSync(dpackPath) || path.basename(dpackPath) !== 'dpack.json') {
      if (stat.isFile()) throw new Error('must specify existing dpack.json file to read key')
      throw new Error('directory must contain a dpack.json')
    }

    debug('reading key from dpack.json:', dpackPath)
    return JSON.parse(fs.readFileSync(dpackPath, 'utf8')).url
  }
}
