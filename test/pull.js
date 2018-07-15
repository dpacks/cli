var path = require('path')
var test = require('tape')
var tempDir = require('temporary-directory')
var spawn = require('./helpers/spawn.js')
var help = require('./helpers')

var dpack = path.resolve(path.join(__dirname, '..', 'bin', 'cli.js'))

test('pull - errors without clone first', function (t) {
  tempDir(function (_, dir, cleanup) {
    var cmd = dpack + ' pull'
    var st = spawn(t, cmd, {cwd: dir})
    st.stderr.match(function (output) {
      t.ok('No existing archive', 'Error: no existing archive')
      st.kill()
      return true
    })
    st.end(cleanup)
  })
})

test('pull - default opts', function (t) {
  // import false so we can pull files later
  help.shareFixtures({import: false}, function (_, fixturesDPack) {
    tempDir(function (_, dir, cleanup) {
      // clone initial dpack
      var cmd = dpack + ' clone ' + fixturesDPack.key.toString('hex') + ' ' + dir
      var st = spawn(t, cmd, {end: false})
      st.stdout.match(function (output) {
        var synced = output.indexOf('dpack synced') > -1
        if (!synced) return false
        st.kill()
        fixturesDPack.close(doPull)
        return true
      })

      function doPull () {
        // TODO: Finish this one. Need some bug fixes on empty pulls =(
        help.shareFixtures({resume: true, import: true}, function (_, fixturesDPack) {
          var cmd = dpack + ' pull'
          var st = spawn(t, cmd, {cwd: dir})
          st.stdout.match(function (output) {
            var downloadFinished = output.indexOf('dpack sync') > -1
            if (!downloadFinished) return false
            st.kill()
            return true
          })
          st.succeeds('exits after finishing download')
          st.stderr.empty()
          st.end(function () {
            fixturesDPack.close()
          })
        })
      }
    })
  })
})
