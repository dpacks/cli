var fs = require('fs')
var os = require('os')
var path = require('path')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var encoding = require('@dwebs/codec')
var recursiveReadSync = require('recursive-readdir-sync')
var DWeb = require('@dpack/core')
var ram = require('random-access-memory')
var ddatabase = require('@ddatabase/core')
var flock = require('@flockcore/core')

module.exports.matchLink = matchDWebLink
module.exports.isDir = isDir
module.exports.testFolder = newTestFolder
module.exports.dwebJson = dwebJson
module.exports.shareFixtures = shareFixtures
module.exports.shareFeed = shareFeed
module.exports.fileList = fileList

function shareFixtures (opts, cb) {
  if (typeof opts === 'function') return shareFixtures(null, opts)
  opts = opts || {}
  var fixtures = path.join(__dirname, '..', 'fixtures')
  try { fs.unlinkSync(path.join(fixtures, '.DS_Store')) } catch (e) { /* ignore error */ }
  if (opts.resume !== true) rimraf.sync(path.join(fixtures, '.dweb'))
  DWeb(fixtures, {}, function (err, dweb) {
    if (err) throw err
    dweb.trackStats()
    dweb.joinNetwork()
    if (opts.import === false) return cb(null, dweb)
    dweb.importFiles({watch: false}, function (err) {
      if (err) throw err
      cb(null, dweb)
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
  var tmpdir = path.join(os.tmpdir(), 'dweb-download-folder')
  rimraf.sync(tmpdir)
  mkdirp.sync(tmpdir)
  return tmpdir
}

function matchDWebLink (str) {
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

function dwebJson (filepath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(filepath, 'dweb.json')))
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

function shareFeed (cb) {
  var sw
  var feed = ddatabase(ram)
  feed.append('hello world', function (err) {
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
