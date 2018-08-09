module.exports = {
  name: 'satoshi',
  help: [
    'Dr. Satoshi is here at your service! I will run two tests:',
    '  1. Check if you can connect to a peer on a public server.',
    '  2. Gives you a link to test direct peer connections.',
    '',
    'Usage: dweb satoshi [<link>]'
  ].join('\n'),
  options: [],
  command: function (opts) {
    var satoshi = require('@dpack/drsatoshi')

    opts.id = opts._[0]
    satoshi(opts)
  }
}
