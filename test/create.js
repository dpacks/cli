var fs = require('fs')
var path = require('path')
var test = require('tape')
var tempDir = require('temporary-directory')
var DPack = require('@dpack/core')
var spawn = require('./helpers/spawn.js')
var help = require('./helpers')

var dpack = path.resolve(path.join(__dirname, '..', 'bin', 'cli.js'))
var fixtures = path.join(__dirname, 'fixtures')

// os x adds this if you view the fixtures in finder and breaks the file count assertions
try { fs.unlinkSync(path.join(fixtures, '.DS_Store')) } catch (e) { /* ignore error */ }

// start without dpack.json
try { fs.unlinkSync(path.join(fixtures, 'dpack.json')) } catch (e) { /* ignore error */ }

test('create - default opts no import', function (t) {
  tempDir(function (_, dir, cleanup) {
    var cmd = dpack + ' create --title data --description thing'
    var st = spawn(t, cmd, {cwd: dir})

    st.stdout.match(function (output) {
      var dpackCreated = output.indexOf('Created empty dPack') > -1
      if (!dpackCreated) return false

      t.ok(help.isDir(path.join(dir, '.dpack')), 'creates dPack directory')

      st.kill()
      return true
    })
    st.succeeds('exits after create finishes')
    st.stderr.empty()
    st.end(cleanup)
  })
})

test('create - errors on existing vault', function (t) {
  tempDir(function (_, dir, cleanup) {
    DPack(dir, function (err, dpack) {
      t.error(err, 'no error')
      dpack.close(function () {
        var cmd = dpack + ' create --title data --description thing'
        var st = spawn(t, cmd, {cwd: dir})
        st.stderr.match(function (output) {
          t.ok(output, 'errors')
          st.kill()
          return true
        })
        st.end()
      })
    })
  })
})

test('create - sync to dWeb after create ok', function (t) {
  tempDir(function (_, dir, cleanup) {
    var cmd = dpack + ' create --title data --description thing'
    var st = spawn(t, cmd, {cwd: dir, end: false})
    st.stdout.match(function (output) {
      var connected = output.indexOf('Created empty dPack') > -1
      if (!connected) return false
      doSync()
      return true
    })

    function doSync () {
      var cmd = dpack + ' dweb '
      var st = spawn(t, cmd, {cwd: dir})

      st.stdout.match(function (output) {
        var connected = output.indexOf('Sharing') > -1
        if (!connected) return false
        st.kill()
        return true
      })
      st.stderr.empty()
      st.end(cleanup)
    }
  })
})

test('create - init alias', function (t) {
  tempDir(function (_, dir, cleanup) {
    var cmd = dpack + ' init --title data --description thing'
    var st = spawn(t, cmd, {cwd: dir})

    st.stdout.match(function (output) {
      var dpackCreated = output.indexOf('Created empty dPack') > -1
      if (!dpackCreated) return false

      t.ok(help.isDir(path.join(dir, '.dpack')), 'creates dpack directory')

      st.kill()
      return true
    })
    st.succeeds('exits after create finishes')
    st.stderr.empty()
    st.end(cleanup)
  })
})

test('create - with path', function (t) {
  tempDir(function (_, dir, cleanup) {
    var cmd = dpack + ' init ' + dir + ' --title data --description thing'
    var st = spawn(t, cmd)
    st.stdout.match(function (output) {
      var dpackCreated = output.indexOf('Created empty dPack') > -1
      if (!dpackCreated) return false

      t.ok(help.isDir(path.join(dir, '.dpack')), 'creates dpack directory')

      st.kill()
      return true
    })
    st.succeeds('exits after create finishes')
    st.stderr.empty()
    st.end(cleanup)
  })
})
