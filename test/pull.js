var path = require('path')
var test = require('tape')
var tempDir = require('temporary-directory')
var spawn = require('./helpers/spawn.js')
var help = require('./helpers')

var dweb = path.resolve(path.join(__dirname, '..', 'bin', 'cli.js'))

test('pull - errors without clone first', function (t) {
  tempDir(function (_, dir, cleanup) {
    var cmd = dweb + ' pull'
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
  help.shareFixtures({import: false}, function (_, fixturesDWeb) {
    tempDir(function (_, dir, cleanup) {
      // clone initial dPack
      var cmd = dweb + ' clone ' + fixturesDWeb.key.toString('hex') + ' ' + dir
      var st = spawn(t, cmd, {end: false})
      st.stdout.match(function (output) {
        var synced = output.indexOf('dPack synced') > -1
        if (!synced) return false
        st.kill()
        fixturesDWeb.close(doPull)
        return true
      })

      function doPull () {
        // TODO: Finish this one. Need some bug fixes on empty pulls =(
        help.shareFixtures({resume: true, import: true}, function (_, fixturesDWeb) {
          var cmd = dweb + ' pull'
          var st = spawn(t, cmd, {cwd: dir})
          st.stdout.match(function (output) {
            var downloadFinished = output.indexOf('dPack sync') > -1
            if (!downloadFinished) return false
            st.kill()
            return true
          })
          st.succeeds('exits after finishing download')
          st.stderr.empty()
          st.end(function () {
            fixturesDWeb.close()
          })
        })
      }
    })
  })
})
