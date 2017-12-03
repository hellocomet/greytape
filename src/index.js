#!/usr/bin/env node

const fs = require('fs')
const os = require('os')

const documenter = require('./components/documenter')
const runner = require('./components/runner')

const greytape = async runtimes => {
  const parser = require('./components/parser')(runtimes)

  if (
    process.argv.length <= 2
    || process.argv[2] === 'help'
    || process.argv[2] === '--help'
    || process.argv[2] === '-h'
  ) {
    // Help (default if no argument is provided)
    // Document the available commands
    documenter(runtimes)
  }
  else {
    let cwd;

    if (runtimes.__cwd) {
      if (runtimes.__cwd === 'DOTFILE') {
        const dotFile = `${os.homedir()}/.${runtimes.__root}.json`

        if (fs.existsSync(dotFile)) {
          const config = require(dotFile)
          cwd = config.cwd
        }
        else {
          const dotFile = require('./components/dotfile')
          cwd = await dotFile(runtimes).catch(e => {
            if (e) {
              console.error("There was an error while creating the dot file :")
              console.error(e)
            } else {
              console.error("The path you entered does not seem to exist. Exiting...")
            }
            process.exit(1)
          })
        }
      }
      else {
        cwd = runtimes.__cwd
      }
    }

    // Interprets the arguments and returns an array of shell commands
    const commands = parser(process.argv.splice(2))
    // Execute shell commands
    runner(commands, cwd)
  }
}

module.exports = greytape
