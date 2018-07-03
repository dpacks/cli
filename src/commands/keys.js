module.exports = {
  name: 'keys',
  command: keys,
  help: [
    'View & manage dPack keys',
    '',
    'Usage:',
    '',
    '  dpack keys              view dPack key and revelation key',
    '  dpack keys export       export dPack secret key',
    '  dpack keys import       import dPack secret key to make a dPack writable',
    ''
  ].join('\n'),
  options: [
    {
      name: 'revelation',
      boolean: true,
      default: false,
      help: 'Print Revelation Key'
    }
  ]
}

function keys (opts) {
  var DPack = require('@dpack/core')
  var parseArgs = require('../parse-args')
  var debug = require('debug')('dpack')

  debug('dpack keys')
  if (!opts.dir) {
    opts.dir = parseArgs(opts).dir || process.cwd()
  }
  opts.createIfMissing = false // keys must always be a resumed vault

  DPack(opts.dir, opts, function (err, dpack) {
    if (err && err.name === 'MissingError') return exit('Sorry, could not find a dpack in this directory.')
    if (err) return exit(err)
    run(dpack, opts)
  })
}

function run (dpack, opts) {
  var subcommand = require('subcommand')
  var prompt = require('prompt')

  var config = {
    root: {
      command: function () {
        console.log(`dweb://${dpack.key.toString('hex')}`)
        if (opts.revelation) console.log(`Revelation key: ${dpack.vault.revelationKey.toString('hex')}`)
        process.exit()
      }
    },
    commands: [
      {
        name: 'export',
        command: function foo (args) {
          if (!dpack.writable) return exit('DPack must be writable to export.')
          console.log(dpack.vault.metadata.secretKey.toString('hex'))
        }
      },
      {
        name: 'import',
        command: function bar (args) {
          if (dpack.writable) return exit('DPack is already writable.')
          importKey()
        }
      }
    ]
  }

  subcommand(config)(process.argv.slice(3))

  function importKey () {
    // get secret key & write

    var schema = {
      properties: {
        key: {
          pattern: /^[a-z0-9]{128}$/,
          message: 'Use `dpack keys export` to get the secret key (128 character hash).',
          hidden: true,
          required: true,
          description: 'dpack secret key'
        }
      }
    }
    prompt.message = ''
    prompt.start()
    prompt.get(schema, function (err, data) {
      if (err) return done(err)
      var secretKey = data.key
      if (typeof secretKey === 'string') secretKey = Buffer.from(secretKey, 'hex')
      // Automatically writes the metadata.ogd file
      dpack.vault.metadata._storage.secretKey.write(0, secretKey, done)
    })

    function done (err) {
      if (err) return exit(err)
      console.log('Successful import. DPack is now writable.')
      exit()
    }
  }
}

function exit (err) {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  process.exit(0)
}
