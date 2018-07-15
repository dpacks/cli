var test = require('tape')
var path = require('path')
var fs = require('fs')
var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var spawn = require('./helpers/spawn')
var help = require('./helpers')
var authServer = require('./helpers/auth-server')

var dpack = path.resolve(path.join(__dirname, '..', 'bin', 'cli.js'))
var baseTestDir = help.testFolder()
var fixtures = path.join(__dirname, 'fixtures')

var port = process.env.PORT || 3000
var SERVER = 'http://localhost:' + port
var config = path.join(__dirname, '.dpackrc-test')
var opts = ' --server=' + SERVER + ' --config=' + config

dpack += opts
rimraf.sync(config)

authServer(port, function (err, server, closeServer) {
  if (err) throw err
  if (!server) return
  test('auth - whoami works when not logged in', function (t) {
    var cmd = dpack + ' whoami '
    var st = spawn(t, cmd, {cwd: baseTestDir})
    st.stderr.match(function (output) {
      t.same(output.trim(), 'Not logged in.', 'printed correct output')
      return true
    })
    st.stdout.empty()
    st.end()
  })

  test('auth - register works', function (t) {
    var cmd = dpack + ' register --email=hello@bob.com --password=joe --username=joe'
    var st = spawn(t, cmd, {cwd: baseTestDir})
    st.stdout.match(function (output) {
      t.same(output.trim(), 'Registered successfully.', 'output success message')
      return true
    })
    st.stderr.empty()
    st.end()
  })

  test('auth - login works', function (t) {
    var cmd = dpack + ' login --email=hello@bob.com --password=joe'
    var st = spawn(t, cmd, {cwd: baseTestDir})
    st.stdout.match(function (output) {
      t.same(output.trim(), 'Logged in successfully.', 'output success message')
      return true
    })
    st.stderr.empty()
    st.end()
  })

  test('auth - whoami works', function (t) {
    var cmd = dpack + ' whoami'
    var st = spawn(t, cmd, {cwd: baseTestDir})
    st.stdout.match(function (output) {
      t.same('hello@bob.com', output.trim(), 'email printed')
      return true
    })
    st.stderr.empty()
    st.end()
  })

  test('auth - publish before create fails', function (t) {
    var cmd = dpack + ' publish'
    rimraf.sync(path.join(fixtures, '.dpack'))
    var st = spawn(t, cmd, {cwd: fixtures})
    st.stdout.empty()
    st.stderr.match(function (output) {
      t.ok(output.indexOf('existing') > -1, 'Create archive before pub')
      return true
    })
    st.end()
  })

  test('auth - create dpack to publish', function (t) {
    rimraf.sync(path.join(fixtures, '.dpack'))
    rimraf.sync(path.join(fixtures, 'dpack.json'))
    var cmd = dpack + ' create --no-import'
    var st = spawn(t, cmd, {cwd: fixtures})
    st.stdout.match(function (output) {
      var link = help.matchLink(output)
      if (!link) return false
      t.ok(link, 'prints link')
      return true
    })
    st.stderr.empty()
    st.end()
  })

  test('auth - publish our awesome dpack', function (t) {
    var cmd = dpack + ' publish --name awesome'
    var st = spawn(t, cmd, {cwd: fixtures})
    st.stdout.match(function (output) {
      var published = output.indexOf('Successfully published') > -1
      if (!published) return false
      t.ok(published, 'published')
      return true
    })
    st.stderr.empty()
    st.end()
  })

  test('auth - publish our awesome dpack with bad dpack.json url', function (t) {
    fs.readFile(path.join(fixtures, 'dpack.json'), function (err, contents) {
      t.ifError(err)
      var info = JSON.parse(contents)
      var oldUrl = info.url
      info.url = info.url.replace('e', 'a')
      fs.writeFile(path.join(fixtures, 'dpack.json'), JSON.stringify(info), function (err) {
        t.ifError(err, 'error after write')
        var cmd = dpack + ' publish --name awesome'
        var st = spawn(t, cmd, {cwd: fixtures})
        st.stdout.match(function (output) {
          var published = output.indexOf('Successfully published') > -1
          if (!published) return false
          t.ok(published, 'published')
          t.same(help.dpackJson(fixtures).url, oldUrl, 'has dpack.json with url')
          return true
        })
        st.stderr.empty()
        st.end()
      })
    })
  })

  test('auth - clone from registry', function (t) {
    // MAKE SURE THESE MATCH WHAT is published above
    // TODO: be less lazy and make a publish helper
    var shortName = 'localhost:' + port + '/joe/awesome' // they'll never guess who wrote these tests
    var baseDir = path.join(baseTestDir, 'dpack_registry_dir')
    mkdirp.sync(baseDir)
    var downloadDir = path.join(baseDir, shortName.split('/').pop())
    var cmd = dpack + ' clone ' + shortName
    var st = spawn(t, cmd, {cwd: baseDir})
    st.stdout.match(function (output) {
      var lookingFor = output.indexOf('Looking for') > -1
      if (!lookingFor) return false
      t.ok(lookingFor, 'starts looking for peers')
      t.ok(output.indexOf(downloadDir) > -1, 'prints dir')
      st.kill()
      return true
    })
    st.stderr.empty()
    st.end(function () {
      rimraf.sync(downloadDir)
    })
  })

  test('auth - publish our awesome dpack without a dpack.json file', function (t) {
    rimraf(path.join(fixtures, 'dpack.json'), function (err) {
      t.ifError(err)
      var cmd = dpack + ' publish --name another-awesome'
      var st = spawn(t, cmd, {cwd: fixtures})
      st.stdout.match(function (output) {
        var published = output.indexOf('Successfully published') > -1
        if (!published) return false
        t.ok(published, 'published')
        t.same(help.dpackJson(fixtures).name, 'another-awesome', 'has dpack.json with name')
        return true
      })
      st.stderr.empty()
      st.end(function () {
        rimraf.sync(path.join(fixtures, '.dpack'))
      })
    })
  })

  test('auth - bad clone from registry', function (t) {
    var shortName = 'localhost:' + port + '/joe/not-at-all-awesome'
    var baseDir = path.join(baseTestDir, 'dpack_registry_dir_too')
    mkdirp.sync(baseDir)
    var downloadDir = path.join(baseDir, shortName.split('/').pop())
    var cmd = dpack + ' clone ' + shortName
    var st = spawn(t, cmd, {cwd: baseDir})
    st.stderr.match(function (output) {
      t.same(output.trim(), 'DPack with that name not found.', 'not found')
      st.kill()
      return true
    })
    st.stdout.empty()
    st.end(function () {
      rimraf.sync(downloadDir)
    })
  })

  test('auth - logout works', function (t) {
    var cmd = dpack + ' logout'
    var st = spawn(t, cmd, {cwd: baseTestDir})
    st.stdout.match(function (output) {
      t.same('Logged out.', output.trim(), 'output correct')
      return true
    })
    st.stderr.empty()
    st.end()
  })

  test('auth - logout prints correctly when trying to log out twice', function (t) {
    var cmd = dpack + ' logout'
    var st = spawn(t, cmd, {cwd: baseTestDir})
    st.stderr.match(function (output) {
      t.same('Not logged in.', output.trim(), 'output correct')
      return true
    })
    st.stdout.empty()
    st.end()
  })

  test('auth - whoami works after logging out', function (t) {
    var cmd = dpack + ' whoami'
    var st = spawn(t, cmd, {cwd: baseTestDir})
    st.stderr.match(function (output) {
      t.same('Not logged in.', output.trim())
      return true
    })
    st.stdout.empty()
    st.end()
  })

  test.onFinish(function () {
    closeServer(function () {
      fs.unlink(config, function () {
        // done!
      })
    })
  })
})
