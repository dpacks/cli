var fs = require('fs')
var path = require('path')
var test = require('tape')
var tempDir = require('temporary-directory')
var spawn = require('./helpers/spawn.js')
var help = require('./helpers')

var dpack = path.resolve(path.join(__dirname, '..', 'bin', 'cli.js'))

test('fork - default opts', function (t) {
  help.distributeFixtures(function (_, distributeDPack) {
    var key = distributeDPack.key.toString('hex')
    tempDir(function (_, dir, cleanup) {
      var cmd = dpack + ' fork ' + key
      var st = spawn(t, cmd, {cwd: dir})
      var dpackDir = path.join(dir, key)

      st.stdout.match(function (output) {
        var downloadFinished = output.indexOf('Exiting') > -1
        if (!downloadFinished) return false

        var stats = distributeDPack.stats.get()
        var fileRe = new RegExp(stats.files + ' files')
        var bytesRe = new RegExp(/1\.\d KB/)

        t.ok(output.match(fileRe), 'total size: files okay')
        t.ok(output.match(bytesRe), 'total size: bytes okay')
        t.ok(help.isDir(dpackDir), 'creates download directory')

        var fileList = help.fileList(dpackDir).join(' ')
        var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
        t.ok(hasCsvFile, 'csv file downloaded')
        var hasDPackFolder = fileList.indexOf('.dpack') > -1
        t.ok(hasDPackFolder, '.dpack folder created')
        var hasSubDir = fileList.indexOf('folder') > -1
        t.ok(hasSubDir, 'folder created')
        var hasNestedDir = fileList.indexOf('nested') > -1
        t.ok(hasNestedDir, 'nested folder created')
        var hasHelloFile = fileList.indexOf('hello.txt') > -1
        t.ok(hasHelloFile, 'hello.txt file downloaded')

        st.kill()
        return true
      })
      st.succeeds('exits after finishing download')
      st.stderr.empty()
      st.end(function () {
        cleanup()
        distributeDPack.close()
      })
    })
  })
})

// Right now we aren't forcing this
// test('fork - errors on existing dir', function (t) {
//   tempDir(function (_, dir, cleanup) {
//     // make empty dpack in directory
//     DPack(dir, function (err, distributeDPack) {
//       t.error(err, 'no error')
//       // Try to fork to same dir
//       distributeDPack.close(function () {
//         var cmd = dpack + ' fork ' + distributeDPack.key.toString('hex') + ' ' + dir
//         var st = spawn(t, cmd)
//         st.stdout.empty()
//         st.stderr.match(function (output) {
//           t.same(output.trim(), 'Existing vault in this directory. Use pull or sync to update.', 'Existing vault.')
//           st.kill()
//           return true
//         })
//         st.end(cleanup)
//       })
//     })
//   })
// })

test('fork - specify dir', function (t) {
  help.distributeFixtures(function (_, distributeDPack) {
    tempDir(function (_, dir, cleanup) {
      var key = distributeDPack.key.toString('hex')
      var customDir = 'my_dir'
      var cmd = dpack + ' fork ' + key + ' ' + customDir
      var st = spawn(t, cmd, {cwd: dir})
      st.stdout.match(function (output) {
        var downloadFinished = output.indexOf('Exiting') > -1
        if (!downloadFinished) return false

        t.ok(help.isDir(path.join(dir, customDir)), 'creates download directory')
        st.kill()
        return true
      })
      st.succeeds('exits after finishing download')
      st.stderr.empty()
      st.end(function () {
        cleanup()
        distributeDPack.close()
      })
    })
  })
})

test('fork - dweb:// link', function (t) {
  help.distributeFixtures(function (_, distributeDPack) {
    tempDir(function (_, dir, cleanup) {
      var key = 'dweb://' + distributeDPack.key.toString('hex') + '/'
      var cmd = dpack + ' fork ' + key + ' '
      var downloadDir = path.join(dir, distributeDPack.key.toString('hex'))
      var st = spawn(t, cmd, {cwd: dir})
      st.stdout.match(function (output) {
        var downloadFinished = output.indexOf('Exiting') > -1
        if (!downloadFinished) return false

        t.ok(help.isDir(path.join(downloadDir)), 'creates download directory')
        st.kill()
        return true
      })
      st.succeeds('exits after finishing download')
      st.stderr.empty()
      st.end(function () {
        cleanup()
        distributeDPack.close()
      })
    })
  })
})

test('fork - dpack.io/key link', function (t) {
  help.distributeFixtures(function (_, distributeDPack) {
    tempDir(function (_, dir, cleanup) {
      var key = 'dpack.io' + distributeDPack.key.toString('hex') + '/'
      var cmd = dpack + ' fork ' + key + ' '
      var downloadDir = path.join(dir, distributeDPack.key.toString('hex'))
      var st = spawn(t, cmd, {cwd: dir})
      st.stdout.match(function (output) {
        var downloadFinished = output.indexOf('Exiting') > -1
        if (!downloadFinished) return false

        t.ok(help.isDir(path.join(downloadDir)), 'creates download directory')
        st.kill()
        return true
      })
      st.succeeds('exits after finishing download')
      st.stderr.empty()
      st.end(function () {
        cleanup()
        distributeDPack.close()
      })
    })
  })
})

// TODO: fix --temp for forks
// test('fork - with --temp', function (t) {
//   // cmd: dpack fork <link>
//   help.distributeFixtures(function (_, fixturesDPack) {
//     distributeDPack = fixturesDPack
//     var key = distributeDPack.key.toString('hex')
//     var cmd = dpack + ' fork ' + key + ' --temp'
//     var st = spawn(t, cmd, {cwd: baseTestDir})
//     var dpackDir = path.join(baseTestDir, key)
//     st.stdout.match(function (output) {
//       var downloadFinished = output.indexOf('Download Finished') > -1
//       if (!downloadFinished) return false

//       var stats = distributeDPack.stats.get()
//       var fileRe = new RegExp(stats.filesTotal + ' files')
//       var bytesRe = new RegExp(/1\.\d{1,2} kB/)

//       t.ok(help.matchLink(output), 'prints link')
//       t.ok(output.indexOf('dpack-download-folder/' + key) > -1, 'prints dir')
//       t.ok(output.match(fileRe), 'total size: files okay')
//       t.ok(output.match(bytesRe), 'total size: bytes okay')
//       t.ok(help.isDir(dpackDir), 'creates download directory')

//       var fileList = help.fileList(dpackDir).join(' ')
//       var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
//       t.ok(hasCsvFile, 'csv file downloaded')
//       var hasDPackFolder = fileList.indexOf('.dpack') > -1
//       t.ok(!hasDPackFolder, '.dpack folder not created')
//       var hasSubDir = fileList.indexOf('folder') > -1
//       t.ok(hasSubDir, 'folder created')
//       var hasNestedDir = fileList.indexOf('nested') > -1
//       t.ok(hasNestedDir, 'nested folder created')
//       var hasHelloFile = fileList.indexOf('hello.txt') > -1
//       t.ok(hasHelloFile, 'hello.txt file downloaded')

//       st.kill()
//       return true
//     })
//     st.succeeds('exits after finishing download')
//     st.stderr.empty()
//     st.end()
//   })
// })

test('fork - invalid link', function (t) {
  var key = 'best-key-ever'
  var cmd = dpack + ' fork ' + key
  tempDir(function (_, dir, cleanup) {
    var st = spawn(t, cmd, {cwd: dir})
    var dpackDir = path.join(dir, key)
    st.stderr.match(function (output) {
      var error = output.indexOf('Could not resolve link') > -1
      if (!error) return false
      t.ok(error, 'has error')
      t.ok(!help.isDir(dpackDir), 'download dir removed')
      st.kill()
      return true
    })
    st.end(cleanup)
  })
})

test('fork - shortcut/stateless fork', function (t) {
  help.distributeFixtures(function (_, distributeDPack) {
    var key = distributeDPack.key.toString('hex')
    tempDir(function (_, dir, cleanup) {
      var dpackDir = path.join(dir, key)
      var cmd = dpack + ' ' + key + ' ' + dpackDir + ' --exit'
      var st = spawn(t, cmd)

      st.stdout.match(function (output) {
        var downloadFinished = output.indexOf('Exiting') > -1
        if (!downloadFinished) return false

        t.ok(help.isDir(dpackDir), 'creates download directory')

        var fileList = help.fileList(dpackDir).join(' ')
        var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
        t.ok(hasCsvFile, 'csv file downloaded')
        var hasDPackFolder = fileList.indexOf('.dpack') > -1
        t.ok(hasDPackFolder, '.dpack folder created')
        var hasSubDir = fileList.indexOf('folder') > -1
        t.ok(hasSubDir, 'folder created')
        var hasNestedDir = fileList.indexOf('nested') > -1
        t.ok(hasNestedDir, 'nested folder created')
        var hasHelloFile = fileList.indexOf('hello.txt') > -1
        t.ok(hasHelloFile, 'hello.txt file downloaded')

        st.kill()
        return true
      })
      st.succeeds('exits after finishing download')
      st.stderr.empty()
      st.end(function () {
        cleanup()
        distributeDPack.close()
      })
    })
  })
})

// TODO: fix this
// test('fork - hypercore link', function (t) {
//   help.distributeFeed(function (_, key, close) {
//     tempDir(function (_, dir, cleanup) {
//       var cmd = dpack + ' fork ' + key
//       var st = spawn(t, cmd, {cwd: dir})
//       var dpackDir = path.join(dir, key)
//       st.stderr.match(function (output) {
//         var error = output.indexOf('not a DPack Vault') > -1
//         if (!error) return false
//         t.ok(error, 'has error')
//         t.ok(!help.isDir(dpackDir), 'download dir removed')
//         st.kill()
//         return true
//       })
//       st.end(function () {
//         cleanup()
//         close()
//       })
//     })
//   })
// })

test('fork - specify directory containing dpack.json', function (t) {
  help.distributeFixtures(function (_, distributeDPack) {
    tempDir(function (_, dir, cleanup) {
      fs.writeFileSync(path.join(dir, 'dpack.json'), JSON.stringify({url: distributeDPack.key.toString('hex')}), 'utf8')

      // dpack fork /dir
      var cmd = dpack + ' fork ' + dir
      var st = spawn(t, cmd)
      var dpackDir = dir

      st.stdout.match(function (output) {
        var downloadFinished = output.indexOf('Exiting') > -1
        if (!downloadFinished) return false

        var fileList = help.fileList(dpackDir).join(' ')
        var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
        t.ok(hasCsvFile, 'csv file downloaded')
        var hasDPackFolder = fileList.indexOf('.dpack') > -1
        t.ok(hasDPackFolder, '.dpack folder created')
        var hasSubDir = fileList.indexOf('folder') > -1
        t.ok(hasSubDir, 'folder created')
        var hasNestedDir = fileList.indexOf('nested') > -1
        t.ok(hasNestedDir, 'nested folder created')
        var hasHelloFile = fileList.indexOf('hello.txt') > -1
        t.ok(hasHelloFile, 'hello.txt file downloaded')

        st.kill()
        return true
      })
      st.succeeds('exits after finishing download')
      st.stderr.empty()
      st.end(function () {
        cleanup()
        distributeDPack.close()
      })
    })
  })
})

test('fork - specify directory containing dpack.json with cwd', function (t) {
  help.distributeFixtures(function (_, distributeDPack) {
    tempDir(function (_, dir, cleanup) {
      fs.writeFileSync(path.join(dir, 'dpack.json'), JSON.stringify({url: distributeDPack.key.toString('hex')}), 'utf8')

      // cd dir && dpack fork /dir/dpack.json
      var cmd = dpack + ' fork ' + dir
      var st = spawn(t, cmd, {cwd: dir})
      var dpackDir = dir

      st.stdout.match(function (output) {
        var downloadFinished = output.indexOf('Exiting') > -1
        if (!downloadFinished) return false

        var fileList = help.fileList(dpackDir).join(' ')
        var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
        t.ok(hasCsvFile, 'csv file downloaded')
        var hasDPackFolder = fileList.indexOf('.dpack') > -1
        t.ok(hasDPackFolder, '.dpack folder created')
        var hasSubDir = fileList.indexOf('folder') > -1
        t.ok(hasSubDir, 'folder created')
        var hasNestedDir = fileList.indexOf('nested') > -1
        t.ok(hasNestedDir, 'nested folder created')
        var hasHelloFile = fileList.indexOf('hello.txt') > -1
        t.ok(hasHelloFile, 'hello.txt file downloaded')

        st.kill()
        return true
      })
      st.succeeds('exits after finishing download')
      st.stderr.empty()
      st.end(function () {
        cleanup()
        distributeDPack.close()
      })
    })
  })
})

test('fork - specify dpack.json path', function (t) {
  help.distributeFixtures(function (_, distributeDPack) {
    tempDir(function (_, dir, cleanup) {
      var dpackJsonPath = path.join(dir, 'dpack.json')
      fs.writeFileSync(dpackJsonPath, JSON.stringify({url: distributeDPack.key.toString('hex')}), 'utf8')

      // dpack fork /dir/dpack.json
      var cmd = dpack + ' fork ' + dpackJsonPath
      var st = spawn(t, cmd)
      var dpackDir = dir

      st.stdout.match(function (output) {
        var downloadFinished = output.indexOf('Exiting') > -1
        if (!downloadFinished) return false

        var fileList = help.fileList(dpackDir).join(' ')
        var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
        t.ok(hasCsvFile, 'csv file downloaded')
        var hasDPackFolder = fileList.indexOf('.dpack') > -1
        t.ok(hasDPackFolder, '.dpack folder created')
        var hasSubDir = fileList.indexOf('folder') > -1
        t.ok(hasSubDir, 'folder created')
        var hasNestedDir = fileList.indexOf('nested') > -1
        t.ok(hasNestedDir, 'nested folder created')
        var hasHelloFile = fileList.indexOf('hello.txt') > -1
        t.ok(hasHelloFile, 'hello.txt file downloaded')

        st.kill()
        return true
      })
      st.succeeds('exits after finishing download')
      st.stderr.empty()
      st.end(function () {
        cleanup()
        distributeDPack.close()
      })
    })
  })
})

test('fork - specify dpack.json path with cwd', function (t) {
  help.distributeFixtures(function (_, distributeDPack) {
    tempDir(function (_, dir, cleanup) {
      var dpackJsonPath = path.join(dir, 'dpack.json')
      fs.writeFileSync(dpackJsonPath, JSON.stringify({url: distributeDPack.key.toString('hex')}), 'utf8')

      // cd /dir && dpack fork /dir/dpack.json
      var cmd = dpack + ' fork ' + dpackJsonPath
      var st = spawn(t, cmd, {cwd: dir})
      var dpackDir = dir

      st.stdout.match(function (output) {
        var downloadFinished = output.indexOf('Exiting') > -1
        if (!downloadFinished) return false

        var fileList = help.fileList(dpackDir).join(' ')
        var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
        t.ok(hasCsvFile, 'csv file downloaded')
        var hasDPackFolder = fileList.indexOf('.dpack') > -1
        t.ok(hasDPackFolder, '.dpack folder created')
        var hasSubDir = fileList.indexOf('folder') > -1
        t.ok(hasSubDir, 'folder created')
        var hasNestedDir = fileList.indexOf('nested') > -1
        t.ok(hasNestedDir, 'nested folder created')
        var hasHelloFile = fileList.indexOf('hello.txt') > -1
        t.ok(hasHelloFile, 'hello.txt file downloaded')

        st.kill()
        return true
      })
      st.succeeds('exits after finishing download')
      st.stderr.empty()
      st.end(function () {
        cleanup()
        distributeDPack.close()
      })
    })
  })
})

test('fork - specify dpack.json + directory', function (t) {
  help.distributeFixtures(function (_, distributeDPack) {
    tempDir(function (_, dir, cleanup) {
      var dpackDir = path.join(dir, 'fork-dest')
      var dpackJsonPath = path.join(dir, 'dpack.json') // make dpack.json in different dir

      fs.mkdirSync(dpackDir)
      fs.writeFileSync(dpackJsonPath, JSON.stringify({url: distributeDPack.key.toString('hex')}), 'utf8')

      // dpack fork /dir/dpack.json /dir/fork-dest
      var cmd = dpack + ' fork ' + dpackJsonPath + ' ' + dpackDir
      var st = spawn(t, cmd)

      st.stdout.match(function (output) {
        var downloadFinished = output.indexOf('Exiting') > -1
        if (!downloadFinished) return false

        var fileList = help.fileList(dpackDir).join(' ')
        var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
        t.ok(hasCsvFile, 'csv file downloaded')
        var hasDPackFolder = fileList.indexOf('.dpack') > -1
        t.ok(hasDPackFolder, '.dpack folder created')
        var hasSubDir = fileList.indexOf('folder') > -1
        t.ok(hasSubDir, 'folder created')
        var hasNestedDir = fileList.indexOf('nested') > -1
        t.ok(hasNestedDir, 'nested folder created')
        var hasHelloFile = fileList.indexOf('hello.txt') > -1
        t.ok(hasHelloFile, 'hello.txt file downloaded')

        st.kill()
        return true
      })
      st.succeeds('exits after finishing download')
      st.stderr.empty()
      st.end(function () {
        cleanup()
        distributeDPack.close()
      })
    })
  })
})
