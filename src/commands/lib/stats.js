var xtend = Object.assign

module.exports = trackStats

function trackStats (state, bus) {
  if (state.dpack) return track()
  bus.once('dpack', track)

  function track () {
    var stats = state.dpack.trackStats(state.opts)
    state.stats = xtend(stats, state.stats)
    stats.on('update', function () {
      bus.emit('stats:update')
      bus.emit('render')
    })
    bus.emit('stats')
  }
}
