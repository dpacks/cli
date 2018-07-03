var test = require('tape')
var dwRem = require('@dwcore/rem')
var DPack = require('..')

test('dpack-core: require dpack-core + make a dPack', function (t) {
  DPack(dwRem, function (err, dpack) {
    t.error(err, 'no error')
    t.ok(dpack, 'makes dPack')
    t.pass('yay')
    t.end()
  })
})
