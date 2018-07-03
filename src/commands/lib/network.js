var bytes = require('bytes').parse
var speed = require('@dwcore/netspeed')
var throttle = require('throttle')
var dWebChannel = require('@dwcore/channel')
var xtend = Object.assign

module.exports = trackNetwork

function trackNetwork (state, bus) {
  if (state.dpack) return track()
  bus.once('dpack', track)

  function track () {
    var opts = state.opts
    if (state.opts.up || state.opts.down) {
      opts = xtend({}, opts, {
        connect: function (local, remote) {
          var streams = [local, remote, local]
          if (state.opts.up) streams.splice(1, 0, throttle(bytes(state.opts.up)))
          if (state.opts.down) streams.splice(-1, 0, throttle(bytes(state.opts.down)))
          dWebChannel(streams)
        }
      })
    }
    var network = state.dpack.joinNetwork(opts, function () {
      bus.emit('network:callback')
    })
    state.network = xtend(network, state.network)
    bus.emit('dpack:network')

    network.on('connection', function (conn, info) {
      bus.emit('render')
      conn.on('close', function () {
        bus.emit('render')
      })
    })

    if (state.opts.sources) trackSources()
    if (state.stats) return trackSpeed()
    bus.once('dpack:stats', trackSpeed)

    function trackSpeed () {
      setInterval(function () {
        bus.emit('render')
      }, state.opts.logspeed)
    }

    function trackSources () {
      state.sources = state.sources || {}
      network.on('connection', function (conn, info) {
        var id = info.id.toString('hex')
        var peerSpeed = speed()

        state.sources[id] = info
        state.sources[id].speed = peerSpeed()
        state.sources[id].getProgress = function () {

          // TODO: how to get right peer from vault.content?
          // var remote = conn.feeds[1].remoteLength
          // // state.dpack.vault.content.sources[0].feed.id.toString('hex')
          // if (!remote) return
          // return remote / dpack.vault.content.length
        }

        conn.feeds.map(function (feed) {
          feed.stream.on('data', function (data) {
            state.sources[id].speed = peerSpeed(data.length)
            bus.emit('render')
          })
          feed.stream.on('error', function (err) {
            state.sources[id].error = err
          })
        })
        bus.emit('render')

        conn.on('close', function () {
          state.sources[id].speed = 0
          state.sources[id].closed = true
          bus.emit('render')
        })
      })
    }
  }
}
