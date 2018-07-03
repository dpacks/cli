var fs = require('fs')
var path = require('path')
var test = require('tape')
var rimraf = require('rimraf')
var tempDir = require('temporary-directory')
var spawn = require('./helpers/spawn.js')
var help = require('./helpers')

var dpack = path.resolve(path.join(__dirname, '..', 'bin', 'cli.js'))
var fixtures = path.join(__dirname, 'fixtures')

test('keys - print keys', function (t) {
  help.distributeFixtures(function (_, distributeDPack) {
    distributeDPack.close(function () {
      var cmd = dpack + ' keys '
      var st = spawn(t, cmd, {cwd: fixtures})

      st.stdout.match(function (output) {
        if (output.indexOf('dweb://') === -1) return false
        t.ok(output.indexOf(distributeDPack.key.toString('hex') > -1), 'prints key')
        st.kill()
        return true
      })
      st.stderr.empty()
      st.end()
    })
  })
})

test('keys - print revelation key', function (t) {
  help.distributeFixtures(function (_, distributeDPack) {
    distributeDPack.close(function () {
      var cmd = dpack + ' keys --revelation'
      var st = spawn(t, cmd, {cwd: fixtures})

      st.stdout.match(function (output) {
        if (output.indexOf('Revelation') === -1) return false
        t.ok(output.indexOf(distributeDPack.key.toString('hex') > -1), 'prints key')
        t.ok(output.indexOf(distributeDPack.vault.revelationKey.toString('hex') > -1), 'prints revelation key')
        st.kill()
        return true
      })
      st.stderr.empty()
      st.end()
    })
  })
})

if (!process.env.TRAVIS) {
  test('keys - export & import secret key', function (t) {
    help.distributeFixtures(function (_, distributeDPack) {
      var key = distributeDPack.key.toString('hex')
      tempDir(function (_, dir, cleanup) {
        var cmd = dpack + ' fork ' + key
        var st = spawn(t, cmd, {cwd: dir, end: false})
        var dpackDir = path.join(dir, key)

        st.stdout.match(function (output) {
          var downloadFinished = output.indexOf('Exiting') > -1
          if (!downloadFinished) return false
          st.kill()
          distributeDPack.close(exchangeKeys)
          return true
        })
        st.stderr.empty()

        function exchangeKeys () {
          var secretKey = null

          var exportKey = dpack + ' keys export'
          var st = spawn(t, exportKey, {cwd: fixtures, end: false})
          st.stdout.match(function (output) {
            if (!output) return false
            secretKey = output.trim()
            st.kill()
            importKey()
            return true
          })
          st.stderr.empty()

          function importKey () {
            var exportKey = dpack + ' keys import'
            var st = spawn(t, exportKey, {cwd: dpackDir})
            st.stdout.match(function (output) {
              if (!output.indexOf('secret key') === -1) return false
              st.stdin.write(secretKey + '\r')
              if (output.indexOf('Successful import') === -1) return false
              t.ok(fs.statSync(path.join(dpackDir, '.dpack', 'metadata.ogd')), 'original dPack file exists')
              st.kill()
              return true
            })
            st.stderr.empty()
            st.end(function () {
              rimraf.sync(path.join(fixtures, '.dpack'))
              cleanup()
            })
          }
        }
      })
    })
  })
}
