module.exports = {
  name: 'unpublish',
  command: unpublish,
  options: [
    {
      name: 'server',
      help: 'Unpublish dPack from this repository.'
    },
    {
      name: 'confirm',
      default: false,
      boolean: true,
      abbr: 'y',
      help: 'Confirm you want to unpublish'
    }
  ]
}

function unpublish (opts) {
  var prompt = require('prompt')
  var path = require('path')
  var DPack = require('@dpack/core')
  var output = require('@dpack/logger/result')
  var chalk = require('chalk')
  var DPackJson = require('@dpack/metadata')
  var Repository = require('../repository')

  if (opts._[0]) opts.server = opts._[0]
  if (!opts.dir) opts.dir = process.cwd() // run in dir for `dpack unpublish`

  var client = Repository(opts)
  var whoami = client.whoami()
  if (!whoami || !whoami.token) {
    var loginErr = output`
      Welcome to ${chalk.green(`dPack`)} Command CLI!

      ${chalk.bold('You must login before unpublishing.')}
      ${chalk.green('dpack login')}
    `
    return exitErr(loginErr)
  }

  opts.createIfMissing = false // unpublish dont try to create new one
  DPack(opts.dir, opts, function (err, dpack) {
    if (err) return exitErr(err)
    // TODO better error msg for non-existing vault
    if (!dpack.writable) return exitErr('Sorry, you can only publish a dPack that you created.')

    var dpackjson = DPackJson(dpack.vault, {file: path.join(dpack.path, 'dpack.json')})
    dpackjson.read(function (err, data) {
      if (err) return exitErr(err)
      if (!data.name) return exitErr('Try `dpack unpublish <name>` with this dPack, we are having trouble reading it.')
      confirm(data.name)
    })
  })

  function confirm (name) {
    console.log(`Unpublishing '${chalk.bold(name)}' from ${chalk.green(whoami.server)}.`)
    prompt.message = ''
    prompt.colors = false
    prompt.start()
    prompt.get([{
      name: 'sure',
      description: 'Are you sure? This cannot be undone. [y/n]',
      pattern: /^[a-zA-Z\s-]+$/,
      message: '',
      required: true
    }], function (err, results) {
      if (err) return console.log(err.message)
      if (results.sure === 'yes' || results.sure === 'y') makeRequest(name)
      else exitErr('Cancelled.')
    })
  }

  function makeRequest (name) {
    client.dpacks.delete({name: name}, function (err, resp, body) {
      if (err && err.message) exitErr(err.message)
      else if (err) exitErr(err.toString())
      if (body.statusCode === 400) return exitErr(new Error(body.message))
      console.log(`Removed your dPack from ${whoami.server}`)
      process.exit(0)
    })
  }
}

function exitErr (err) {
  console.error(err)
  process.exit(1)
}
