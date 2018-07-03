
module.exports = runHttp

function runHttp (state, bus) {
  if (state.dpack) return serve()
  bus.once('dpack', serve)

  function serve () {
    var port = (typeof state.opts.http === 'boolean') ? 8080 : state.opts.http
    var server = state.dpack.serveHttp({ port: port })

    server.on('listening', function () {
      state.http = { port: port, listening: true }
      bus.emit('render')
    })
  }
}
