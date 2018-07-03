var fs = require('fs')
var os = require('os')
var path = require('path')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var encoding = require('@dwebs/codec')
var recursiveReadSync = require('recursive-readdir-sync')
var DPack = require('@dpack/core')
var dwREM = require('@dwcore/rem')
var ddatabase = require('@ddatabase/core')
var flock = require('@flockcore/revelation')

module.exports.matchLink = matchDPackLink
module.exports.isDir = isDir
module.exports.testFolder = newTestFolder
module.exports.dpackJson = dpackJson
module.exports.distributeFixtures = distributeFixtures
module.exports.distributeFeed = distributeFeed
module.exports.fileList = fileList

function distributeFixtures (opts, cb) {
  if (typeof opts === 'function') return distributeFixtures(null, opts)
  opts = opts || {}
  var fixtures = path.join(__dirname, '..', 'fixtures')
  // os x adds this if you view the fixtures in finder and breaks the file count assertions
  try { fs.unlinkSync(path.join(fixtures, '.DS_Store')) } catch (e) { /* ignore error */ }
  if (opts.resume !== true) rimraf.sync(path.join(fixtures, '.dpack'))
  DPack(fixtures, {}, function (err, dpack) {
    if (err) throw err
    dpack.trackStats()
    dpack.joinNetwork()
    if (opts.import === false) return cb(null, dpack)
    dpack.importFiles({watch: false}, function (err) {
      if (err) throw err
      cb(null, dpack)
    })
  })
}

function fileList (dir) {
  try {
    return recursiveReadSync(dir)
  } catch (e) {
    return []
  }
}

function newTestFolder () {
  var tmpdir = path.join(os.tmpdir(), 'dpack-download-folder')
  rimraf.sync(tmpdir)
  mkdirp.sync(tmpdir)
  return tmpdir
}

function matchDPackLink (str) {
  var match = str.match(/[A-Za-z0-9]{64}/)
  if (!match) return false
  var key
  try {
    key = encoding.toStr(match[0].trim())
  } catch (e) {
    return false
  }
  return key
}

function dpackJson (filepath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(filepath, 'dpack.json')))
  } catch (e) {
    return {}
  }
}

function isDir (dir) {
  try {
    return fs.statSync(dir).isDirectory()
  } catch (e) {
    return false
  }
}

function distributeFeed (cb) {
  var sw
  var feed = ddatabase(dwREM)
  feed.append('greetings martian', function (err) {
    if (err) throw err
    cb(null, encoding.toStr(feed.key), close)
  })
  feed.ready(function () {
    sw = flock(feed)
  })

  function close (cb) {
    feed.close(function () {
      sw.close(cb)
    })
  }
}
