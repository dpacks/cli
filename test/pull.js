var path = require('path')
var test = require('tape')
var tempDir = require('temporary-directory')
var spawn = require('./helpers/spawn.js')
var help = require('./helpers')

var dpack = path.resolve(path.join(__dirname, '..', 'bin', 'cli.js'))

test('pull - errors without fork first', function (t) {
  tempDir(function (_, dir, cleanup) {
    var cmd = dpack + ' pull'
    var st = spawn(t, cmd, {cwd: dir})
    st.stderr.match(function (output) {
      t.ok('No existing vault', 'Error: no existing vault')
      st.kill()
      return true
    })
    st.end(cleanup)
  })
})

test('pull - default opts', function (t) {
  // import false so we can pull files later
  help.distributeFixtures({import: false}, function (_, fixturesDPack) {
    tempDir(function (_, dir, cleanup) {
      // fork initial dpack
      var cmd = dpack + ' fork ' + fixturesDPack.key.toString('hex') + ' ' + dir
      var st = spawn(t, cmd, {end: false})
      st.stdout.match(function (output) {
        var synced = output.indexOf('dpack synced to dWeb') > -1
        if (!synced) return false
        st.kill()
        fixturesDPack.close(doPull)
        return true
      })

      function doPull () {
        // TODO: Finish this one. Need some bug fixes on empty pulls =(
        help.distributeFixtures({resume: true, import: true}, function (_, fixturesDPack) {
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

// test('pull - default opts', function (t) {
//   // cmd: dpack pull
//   // import the files to the distributor so we can pull new data
//   distributeDPack.importFiles(function (err) {
//     if (err) throw err

//     var dpackDir = path.join(baseTestDir, distributeKey)
//     var cmd = dpack + ' pull'
//     var st = spawn(t, cmd, {cwd: dpackDir})
//     st.stdout.match(function (output) {
//       var downloadFinished = output.indexOf('Download Finished') > -1
//       if (!downloadFinished) return false

//       var stats = distributeDPack.stats.get()
//       var fileRe = new RegExp(stats.filesTotal + ' files')
//       var bytesRe = new RegExp(/1\.\d{1,2} kB/)

//       t.ok(help.matchLink(output), 'prints link')
//       t.ok(output.indexOf('dpack-download-folder/' + distributeKey) > -1, 'prints dir')
//       t.ok(output.match(fileRe), 'total size: files okay')
//       t.ok(output.match(bytesRe), 'total size: bytes okay')
//       t.ok(help.isDir(dpackDir), 'creates download directory')

//       var fileList = help.fileList(dpackDir).join(' ')
//       var hasCsvFile = fileList.indexOf('all_hour.csv') > -1
//       t.ok(hasCsvFile, 'csv file downloaded')
//       var hasDPackFolder = fileList.indexOf('.dpack') > -1
//       t.ok(hasDPackFolder, '.dpack folder created')
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

// test('pull - with dir arg', function (t) {
//   var dirName = distributeKey
//   var dpackDir = path.join(baseTestDir, distributeKey)
//   var cmd = dpack + ' pull ' + dirName
//   var st = spawn(t, cmd, {cwd: baseTestDir})
//   st.stdout.match(function (output) {
//     var downloadFinished = output.indexOf('Download Finished') > -1
//     if (!downloadFinished) return false

//     t.ok(output.indexOf('dpack-download-folder/' + dirName) > -1, 'prints dir')
//     t.ok(help.isDir(dpackDir), 'creates download directory')

//     st.kill()
//     return true
//   })
//   st.succeeds('exits after finishing download')
//   st.stderr.empty()
//   st.end()
// })
