var test = require('tape')
var ram = require('random-access-memory')
var DPack = require('..')

test('dpack-core: require @dpack/core + make a dPack', function (t) {
  DPack(ram, function (err, dpack) {
    t.error(err, 'no error')
    t.ok(dpack, 'makes dPack')
    t.pass('yay')
    t.end()
  })
})
