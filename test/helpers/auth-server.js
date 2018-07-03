var path = require('path')
var rimraf = require('rimraf')
var Server, initDb
try {
  Server = require('@dpacks/api/server')
  initDb = require('@dpacks/api/server/database/init')
} catch (e) {
  console.log('Disabling auth tests, run `npm install @dpacks/api` to enable them.')
}

module.exports = createServer

function createServer (port, cb) {
  if (!Server || !initDb) return cb(null)
  var config = {
    mixpanel: 'nothing',
    email: {
      fromEmail: 'hi@example.com'
    },
    dwid: {
      secret: 'very secret code',
      db: path.join(__dirname, '..', 'test-dwid.db')
    },
    db: {
      dialect: 'sqlite3',
      connection: { filename: path.join(__dirname, '..', 'test-sqlite.db') },
      useNullAsDefault: true
    },
    vaultr: path.join(__dirname, '..', 'test-vaultr'),
    whitelist: false,
    port: port || 8888
  }
  rimraf.sync(config.vaultr)
  rimraf.sync(config.db.connection.filename)
  rimraf.sync(config.dwid.db)

  initDb(config.db, function (err, db) {
    if (err) return cb(err)

    const server = Server(config, db)
    server.listen(config.port, function () {
      console.log('listening', config.port)
    })

    cb(null, server, close)

    function close (cb) {
      server.close(function () {
        rimraf.sync(config.dwid.db)
        rimraf.sync(config.db.connection.filename)
        process.exit()
      })
    }
  })
}
