module.exports = {
  name: 'login',
  command: login,
  help: [
    'Login to a dPack Repository server',
    'Usage: dpack login [<repository>]',
    '',
    'Publish your dPacks so other users can revelate them.',
    'Please register before trying to login.'
  ].join('\n'),
  options: [
    {
      name: 'server',
      help: 'Your dPack Repository server (must be registered to login).'
    }
  ]
}

function login (opts) {
  var prompt = require('prompt')
  var output = require('@dpack/logger/result')
  var chalk = require('chalk')
  var Repository = require('../../repository')

  if (opts._[0]) opts.server = opts._[0]
  var welcome = output`
    Welcome to ${chalk.green(`dPack`)} Command CLI!
    Login to publish your dPacks to the dWeb.

  `
  console.log(welcome)

  var schema = {
    properties: {
      server: {
        description: chalk.magenta('dPack Repository'),
        default: opts.server || 'dpacks.io',
        required: true
      },
      email: {
        description: chalk.magenta('Email'),
        message: 'Email required',
        required: true
      },
      password: {
        description: chalk.magenta('Password'),
        message: 'Password required',
        required: true,
        hidden: true,
        replace: '*'
      }
    }
  }

  prompt.override = opts
  prompt.message = ''
  prompt.start()
  prompt.get(schema, function (err, results) {
    if (err) return exitErr(err)
    opts.server = results.server
    makeRequest(results)
  })

  function makeRequest (user) {
    var client = Repository(opts)
    client.login({
      email: user.email,
      password: user.password
    }, function (err, resp, body) {
      if (err && err.message) return exitErr(err.message)
      else if (err) return exitErr(err.toString())

      console.log(output`
        Logged you in to ${chalk.green(opts.server)}!

        Now you can publish dPacks and distribute to the dWeb:
        * Run ${chalk.green(`dpack publish`)} to publish a dPack!
        * View & Distribute your dPacks at ${opts.server}
      `)
      process.exit(0)
    })
  }
}

function exitErr (err) {
  console.error(err)
  process.exit(1)
}
