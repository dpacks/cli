module.exports = {
  name: 'publish',
  command: publish,
  help: [
    'Publish your dPack to a dPack Repository',
    'Usage: dPack publish [<repository>]',
    '',
    'By default it will publish to your active registry.',
    'Specify the server to change where the dPack is published.'
  ].join('\n'),
  options: [
    {
      name: 'server',
      help: 'Publish dPack to this repositories. Defaults to active login.'
    }
  ]
}

function publish (opts) {
  var path = require('path')
  var DPack = require('@dpack/core')
  var encoding = require('@dwebs/codec')
  var output = require('@dpack/logger/result')
  var prompt = require('prompt')
  var chalk = require('chalk')
  var DPackJson = require('@dpack/metadata')
  var xtend = require('xtend')
  var Repository = require('../repository')

  if (!opts.dir) opts.dir = process.cwd()
  if (opts._[0]) opts.server = opts._[0]
  if (!opts.server) opts.server = 'dpacks.io' // nicer error message if not logged in

  var client = Repository(opts)
  var whoami = client.whoami()
  if (!whoami || !whoami.token) {
    var loginErr = output`
      Welcome to ${chalk.green(`dPack`)}!
      Publish your dPacks to ${chalk.green(opts.server)}.

      ${chalk.bold('Please login before publishing')}
      ${chalk.green('dpack login')}

      New to ${chalk.green(opts.server)} and need an account?
      ${chalk.green('dpack register')}

      Explore public dPacks at ${chalk.blue('dpacks.io/explore')}
    `
    return exitErr(loginErr)
  }

  opts.createIfMissing = false // publish must always be a resumed vault
  DPack(opts.dir, opts, function (err, dpack) {
    if (err && err.name === 'MissingError') return exitErr('No existing dPack in this directory. Create a dPack before publishing.')
    else if (err) return exitErr(err)

    dpack.joinNetwork() // join network to upload metadata

    var dpackjson = DPackJson(dpack.vault, {file: path.join(dpack.path, 'dpack.json')})
    dpackjson.read(publish)

    function publish (_, data) {
      // ignore dpackjson.read() err, we'll prompt for name

      // xtend dpack.json with opts
      var dpackInfo = xtend({
        name: opts.name,
        url: 'dweb://' + encoding.toStr(dpack.key), // force correct url in publish? what about non-dpack urls?
        title: opts.title,
        description: opts.description
      }, data)
      var welcome = output`
        Publishing dPack to ${chalk.green(opts.server)}!

      `
      console.log(welcome)

      if (dpackInfo.name) return makeRequest(dpackInfo)

      prompt.message = ''
      prompt.start()
      prompt.get({
        properties: {
          name: {
            description: chalk.magenta('dpack name'),
            pattern: /^[a-zA-Z0-9-]+$/,
            message: `A dpack name can only have letters, numbers, or dashes.\n Like ${chalk.bold('cool-cats-12meow')}`,
            required: true
          }
        }
      }, function (err, results) {
        if (err) return exitErr(err)
        dpackInfo.name = results.name
        makeRequest(dpackInfo)
      })
    }

    function makeRequest (dpackInfo) {
      console.log(`Please wait, '${chalk.bold(dpackInfo.name)}' will soon be ready for its great unveiling...`)
      client.dpacks.create(dpackInfo, function (err, resp, body) {
        if (err) {
          if (err.message) {
            if (err.message === 'timed out') {
              return exitErr(output`${chalk.red('\nERROR: ' + opts.server + ' could not connect to your computer.')}
              Troubleshoot here: ${chalk.green('https://docs.dpack.io/troubleshooting#networking-issues')}
              `)
            }
            var str = err.message.trim()
            if (str === 'jwt expired') return exitErr(`Session expired, please ${chalk.green('dpack login')} again`)
            return exitErr('ERROR: ' + err.message) // node error
          }

          // server response errors
          return exitErr('ERROR: ' + err.toString())
        }
        if (body.statusCode === 400) return exitErr(new Error(body.message))

        dpackjson.write(dpackInfo, function (err) {
          if (err) return exitErr(err)
          // TODO: write published url to dpack.json (need spec)
          var msg = output`

            We ${body.updated === 1 ? 'updated' : 'published'} your dPack!
            ${chalk.blue.underline(`${opts.server}/${whoami.username}/${dpackInfo.name}`)}
          `// TODO: get url back? it'd be better to confirm link than guess username/dpackname structure

          console.log(msg)
          if (body.updated === 1) {
            console.log(output`

              ${chalk.dim.green('Cool fact #21')}
              ${opts.server} will live update when you are sharing your dPack!
              You only need to publish again if your dPack link changes.
            `)
          } else {
            console.log(output`

              Remember to use ${chalk.green('dpack dist')} before sharing.
              This will make sure your dPack is available.
            `)
          }
          process.exit(0)
        })
      })
    }
  })
}

function exitErr (err) {
  console.error(err)
  process.exit(1)
}
