// var fs = require('fs')
// var path = require('path')
// var test = require('tape')
// var rimraf = require('rimraf')
// var spawn = require('./helpers/spawn.js')
// var help = require('./helpers')

// var dpack = path.resolve(path.join(__dirname, '..', 'bin', 'cli.js'))
// if (process.env.TRAVIS) dpack += ' --no-watch '
// var fixtures = path.join(__dirname, 'fixtures')

// // os x adds this if you view the fixtures in finder and breaks the file count assertions
// try { fs.unlinkSync(path.join(fixtures, '.DS_Store')) } catch (e) { /* ignore error */ }

// // start without dpack.json
// try { fs.unlinkSync(path.join(fixtures, 'dpack.json')) } catch (e) { /* ignore error */ }

// test('dist - default opts', function (t) {
//   rimraf.sync(path.join(fixtures, '.dpack'))
//   var cmd = dpack + ' dist'
//   var st = spawn(t, cmd, {cwd: fixtures})

//   st.stdout.match(function (output) {
//     var importFinished = output.indexOf('Total Size') > -1
//     if (!importFinished) return false

//     t.ok(help.isDir(path.join(fixtures, '.dpack')), 'creates dpack directory')
//     t.ok(output.indexOf('Looking for connections') > -1, 'network')

//     st.kill()
//     return true
//   })
//   st.stderr.empty()
//   st.end()
// })

// test('dist - with dir arg', function (t) {
//   rimraf.sync(path.join(fixtures, '.dpack'))
//   var cmd = dpack + ' dist ' + fixtures
//   var st = spawn(t, cmd)

//   st.stdout.match(function (output) {
//     var importFinished = output.indexOf('Total Size') > -1
//     if (!importFinished) return false

//     t.ok(help.isDir(path.join(fixtures, '.dpack')), 'creates dpack directory')
//     t.ok(output.indexOf('Looking for connections') > -1, 'network')

//     st.kill()
//     return true
//   })
//   st.stderr.empty()
//   st.end()
// })

// test.onFinish(function () {
//   rimraf.sync(path.join(fixtures, '.dpack'))
// })
