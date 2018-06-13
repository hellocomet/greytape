#!/usr/bin/env node

const fs = require('fs')
const os = require('os')

const documenter = require('./components/documenter')
const parser = require('./components/parser')
const composer = require('./components/composer')
const runner = require('./components/runner')

const greytape = async runtimes => {
  if (
    process.argv.length <= 2
    || process.argv[2] === 'help'
    || process.argv[2] === '--help'
    || process.argv[2] === '-h'
  ) {
    // Help (default if no argument is provided)
    // Document the available commands
    documenter(runtimes)
    process.exit(0)
  }
  else {
    const dotFile = require('./components/dotfile')
    const cwd = await dotFile(runtimes)

    // Interpret the arguments and return a single runtime and its arguments
    const { runtime, args } = parser(runtimes, process.argv.splice(2))
    // Compose the actual shell commands
    const commands = composer(runtime, args)
    // Execute shell commands
    const result = runner(commands, cwd, runtimes.__debug)

    // The process returns exits with the same status as the last executed command
    process.exit(result)
  }
}

module.exports = greytape
