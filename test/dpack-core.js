var test = require('tape')
var ram = require('random-access-memory')
var DWeb = require('..')

test('dpack-core: require @dpack/core + make a dPack', function (t) {
  DWeb(ram, function (err, dweb) {
    t.error(err, 'no error')
    t.ok(dweb, 'makes dPack')
    t.pass('yay')
    t.end()
  })
})
