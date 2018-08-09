var xtend = Object.assign

module.exports = trackStats

function trackStats (state, bus) {
  if (state.dweb) return track()
  bus.once('dweb', track)

  function track () {
    var stats = state.dweb.trackStats(state.opts)
    state.stats = xtend(stats, state.stats)
    stats.on('update', function () {
      bus.emit('stats:update')
      bus.emit('render')
    })
    bus.emit('stats')
  }
}
