module.exports = {
  name: 'whoami',
  command: whoami,
  help: [
    'Get login information',
    'Usage: dpack login [<repository>]',
    '',
    'Get information for active repository or specify your repository.'
  ].join('\n'),
  options: [
    {
      name: 'server',
      help: 'Server to get login information for. Defaults to active login.'
    }
  ]
}

function whoami (opts) {
  var output = require('@dpack/logger/result')
  var chalk = require('chalk')
  var Repository = require('../../repository')

  if (opts._[0]) opts.server = opts._[0]

  var client = Repository(opts)
  var login = client.whoami()
  if (!login || !login.token) {
    if (!opts.server) return exitErr('No login information found.')
    return exitErr('No login information found for that server.')
  }
  console.log(output`
    Your active dPack Repository information:

    ---
    ${chalk.green(login.server)}
    Email: ${login.email}
    Username: ${login.username}
    ---

    Change your repository by logging in again:
    ${chalk.dim.green('dpack login <repository-url>')}
  `)
  process.exit(0)
}

function exitErr (err) {
  console.error(err)
  process.exit(1)
}
