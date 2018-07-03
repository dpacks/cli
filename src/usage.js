module.exports = function (opts, help, usage) {
  if (opts.version) {
    var pkg = require('../package.json')
    console.error(pkg.version)
    process.exit(1)
  }
  var msg = `
Usage: dpack <cmd> [<dir>] [options]

Create, Distribute and Sync Files:
   dpack create                  create empty dPack and dpack.json
   dpack dist                    create dPack, import files to the respository and distribute to the dWeb
   dpack sync                    import files to existing dpack & sync with network

Fork, Pull and Sync Files:
   dpack fork <link> [<dir>]     Fork a dPack via link to <dir>
   dpack pull                    Pull updates of a dPack & exit
   dpack dweb                    Sync dPack with the dWeb

dPack Info:
   dpack log                     Print a dPack's history
   dpack status                  Prints key and information about a local dPack

dPack Developer Management:
   dpack <cmd> [<repository>]    All commands take <repository> option
   dpack register                Register new repository account
   dpack login                   Login to repository account
   dpack publish                 Publish dPack to repository
   dpack whoami                  Print repository account information
   dpack logout                  Logout from current repository

dPack Shortcut Commands:
   dpack <link> [<dir>]          Fork dPack or Sync dPack in <dir> with dWeb
   dpack <dir>                   Create dPack and sync dPack in <dir> with dWeb

dPack Troubleshooting & Help:
   dpack satoshi                 Check with Dr. Satoshi on the current health of the dWeb
   dpack help                    Print dPack manpage
   dpack <command> --help, -h    Print specific usage parameters for a dPack command
   dpack --version, -v           Print current dPack version

  `
  console.error(msg)
  if (usage) {
    console.error('General Options:')
    console.error(usage)
  }
  console.error('Have fun using dPack! Learn more at docs.dpack.io')
  process.exit(1)
}
