module.exports = {
  name: 'logout',
  command: logout,
  help: [
    'Logout from current dPack Repository server',
    'Usage: dpack logout [<repository>]',
    '',
    'Specify server if you want to from non-active other server.',
    'Check active server with `dpack whoami`.'
  ].join('\n'),
  options: [
    {
      name: 'server',
      help: 'Server to log out of. Defaults to active login.'
    }
  ]
}

function logout (opts) {
  var chalk = require('chalk')
  var Repository = require('../../repository')

  if (opts._[0]) opts.server = opts._[0]

  var client = Repository(opts)

  var whoami = client.whoami()
  if (!whoami || !whoami.token) return exitErr('Not currently logged in to that server.')
  client.logout(function (err) {
    if (err) return exitErr(err)
    console.log(`Logged out of ${chalk.green(whoami.server)}`)
    process.exit(0)
  })
}

function exitErr (err) {
  console.error(err)
  process.exit(1)
}
