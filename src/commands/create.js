module.exports = {
  name: 'create',
  command: create,
  help: [
    'Create an empty dPack and dpack.json',
    '',
    'Usage: dpack create [directory]'
  ].join('\n'),
  options: [
    {
      name: 'yes',
      boolean: true,
      default: false,
      abbr: 'y',
      help: 'Skip dpack.json creation.'
    }
  ]
}

function create (opts) {
  var path = require('path')
  var fs = require('fs')
  var DPack = require('@dpack/core')
  var result = require('@dpack/logger/result')
  var DPackJson = require('@dpack/metadata')
  var prompt = require('prompt')
  var chalk = require('chalk')
  var parseArgs = require('../parse-args')
  var debug = require('debug')('dpack')

  debug('dpack create')
  if (!opts.dir) {
    opts.dir = parseArgs(opts).dir || process.cwd()
  }

  var welcome = `Welcome to ${chalk.green(`dPack`)} Command CLI!`
  var intro = result(`
    You can turn any folder on your computer into a dPack.
    A dPack is a folder with some magic.
    Your dPack is ready!
    We will walk you through creating a 'dpack.json' file.
    (You can skip dpack.json and get started now.)
    Learn more about dpack.json: ${chalk.blue(`http://docs.dpack.io/metadata`)}
    ${chalk.dim('Ctrl+C to exit at any time')}
  `)
  var outro

  // Force certain options
  opts.errorIfExists = true

  console.log(welcome)
  DPack(opts.dir, opts, function (err, dpack) {
    if (err && err.name === 'ExistsError') return exitErr('\nVault already exists.\nYou can use `dpack pull` to update.')
    if (err) return exitErr(err)

    outro = result(`
      Created empty dPack in ${dpack.path}/.dpack
      Now you can add files and distribute:
      * Run ${chalk.green(`dpack dist`)} to create metadata and pull.
      * Copy the unique dWeb link and securely share it.
      ${chalk.blue(`dweb://${dpack.key.toString('hex')}`)}
    `)

    if (opts.yes) return done()

    console.log(intro)
    var dpackjson = DPackJson(dpack.vault, { file: path.join(opts.dir, 'dpack.json') })
    fs.readFile(path.join(opts.dir, 'dpack.json'), 'utf-8', function (err, data) {
      if (err || !data) return doPrompt()
      data = JSON.parse(data)
      debug('read existing dpack.json data', data)
      doPrompt(data)
    })

    function doPrompt (data) {
      if (!data) data = {}

      var schema = {
        properties: {
          title: {
            description: chalk.magenta('Title'),
            default: data.title || '',
            // pattern: /^[a-zA-Z\s\-]+$/,
            // message: 'Name must be only letters, spaces, or dashes',
            required: false
          },
          description: {
            description: chalk.magenta('Description'),
            default: data.description || ''
          }
        }
      }

      prompt.override = { title: opts.title, description: opts.description }
      prompt.message = '' // chalk.green('> ')
      // prompt.delimiter = ''
      prompt.start()
      prompt.get(schema, writeDPackJson)

      function writeDPackJson (err, results) {
        if (err) return exitErr(err) // prompt error
        if (!results.title && !results.description) return done()
        dpackjson.create(results, done)
      }
    }

    function done (err) {
      if (err) return exitErr(err)
      console.log(outro)
    }
  })

  function exitErr (err) {
    if (err && err.message === 'canceled') {
      console.log('')
      console.log(outro)
      process.exit(0)
    }
    console.error(err)
    process.exit(1)
  }
}
