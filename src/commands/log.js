
module.exports = {
  name: 'log',
  help: [
    'View history and information about a dPack',
    '',
    'Usage: dweb log [dir|link]'
  ].join('\n'),
  options: [
    {
      name: 'live',
      boolean: true,
      default: false,
      help: 'View live updates to history.'
    }
  ],
  command: function (opts) {
    var feed = require('@dpack/feed')
    feed(opts)
  }
}
