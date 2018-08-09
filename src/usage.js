module.exports = function (opts, help, usage) {
  if (opts.version) {
    var pkg = require('../package.json')
    console.error(pkg.version)
    process.exit(1)
  }
  var msg = `
Usage: dweb <cmd> [<dir>] [options]

Create, Distribute and Sync Files:
   dweb create                  create empty dPack and dweb.json
   dweb dist                    create dPack, import files to the respository and distribute to the dWeb
   dweb sync                    import files to existing dPack & sync with network

Fork, Pull and Sync Files:
   dweb fork <link> [<dir>]     Fork a dPack via link to <dir>
   dweb pull                    Pull updates of a dPack & exit
   dweb sync                    Sync dPack with the dWeb

dPack Info:
   dweb log                     Print a dPack's history
   dweb status                  Prints key and information about a local dPack

dPack Developer Management:
   dweb <cmd> [<repository>]    All commands take <repository> option
   dweb register                Register new repository account
   dweb login                   Login to repository account
   dweb publish                 Publish dPack to repository
   dweb whoami                  Print repository account information
   dweb logout                  Logout from current repository

dPack Shortcut Commands:
   dweb <link> [<dir>]          Fork dPack or Sync dPack in <dir> with dWeb
   dweb <dir>                   Create dPack and sync dPack in <dir> with dWeb

dPack Troubleshooting & Help:
   dweb satoshi                 Check with Dr. Satoshi on the current health of the dWeb
   dweb help                    Print dPack manpage
   dweb <command> --help, -h    Print specific usage parameters for a dPack command
   dweb --version, -v           Print current dPack version

  `
  console.error(msg)
  if (usage) {
    console.error('General Options:')
    console.error(usage)
  }
  console.error('Have fun using dPack! Learn more at docs.dpack.io')
  process.exit(1)
}
