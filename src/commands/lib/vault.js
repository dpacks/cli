var debug = require('debug')('dpack')
var path = require('path')
var EventEmitter = require('events').EventEmitter
var doImport = require('./import-progress')
var stats = require('./stats')
var network = require('./network')
var download = require('./download')
var serve = require('./serve-http')

module.exports = function (state, bus) {
  state.warnings = state.warnings || []
  bus.once('dweb', function () {
    state.writable = state.dweb.writable
    state.joinNetwork = !(state.joinNetwork === false)

    stats(state, bus)
    if (state.joinNetwork) network(state, bus)
    if (state.opts.http) serve(state, bus)

    if (state.writable && state.opts.import) doImport(state, bus)
    else if (state.opts.thin) selectiveSync(state, bus)
    else download(state, bus)

    if (state.dweb.vault.content) return bus.emit('vault:content')
    state.dweb.vault.once('content', function () {
      bus.emit('vault:content')
    })
  })

  bus.once('vault:content', function () {
    state.hasContent = true
  })
}

function selectiveSync (state, bus) {
  var vault = state.dweb.vault
  debug('thin mode. downloading metadata')
  var emitter = new EventEmitter()

  function download (entry) {
    debug('selected', entry)
    vault.stat(entry, function (err, stat) {
      if (err) return state.warnings.push(err.message)
      if (stat.isDirectory()) downloadDir(entry, stat)
      if (stat.isFile()) downloadFile(entry, stat)
    })
  }

  function downloadDir (dirname, stat) {
    debug('downloading dir', dirname)
    vault.readdir(dirname, function (err, entries) {
      if (err) return bus.emit('exit:error', err)
      entries.forEach(function (entry) {
        emitter.emit('download', path.join(dirname, entry))
      })
    })
  }

  function downloadFile (entry, stat) {
    var start = stat.offset
    var end = stat.offset + stat.blocks
    state.selectedByteLength += stat.size
    bus.emit('render')
    if (start === 0 && end === 0) return
    debug('downloading', entry, start, end)
    vault.content.download({start, end}, function () {
      debug('success', entry)
    })
  }

  emitter.on('download', download)
  if (state.opts.selectedFiles) state.opts.selectedFiles.forEach(download)

  if (state.opts.empty) {
    vault.metadata.update(function () {
      return bus.emit('exit:warn', `dPack successfully created in empty mode. Download files using pull or sync.`)
    })
  }

  vault.on('update', function () {
    debug('vault update')
    bus.emit('render')
  })
}
