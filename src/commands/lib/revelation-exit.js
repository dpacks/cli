var output = require('@dpack/logger/result')

module.exports = revelationExit

function revelationExit (state, bus) {
  bus.once('network:callback', checkExit)

  function checkExit () {
    if (state.dpack.network.connected || !state.opts.exit) return
    if (state.dpack.network.connecting) return setTimeout(checkExit, 500) // wait to see if any connections resolve
    var msg = output`
      dPack could not find any connections for that link.
      There may not be any sources online.

      Run 'dpack satoshi' if you keep having trouble.
    `
    bus.emit('exit:warn', msg)
  }
}
