var xtend = require('xtend')
var RepositoryClient = require('@dpacks/repository')

module.exports = function (opts) {
  var dwidOpts = {
    server: opts.server,
    config: {
      filepath: opts.config // defaults to ~/.dpackrc via @dpacks/repository
    }
  }
  var defaults = {
    // xtend doesn't overwrite when key is present but undefined
    // If we want a default, make sure it's not going to passed as undefined
  }
  var options = xtend(defaults, dwidOpts)
  return RepositoryClient(options)
}
