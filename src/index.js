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
    process.exit(0)
  }
  else {
    const dotFile = require('./components/dotfile')
    const cwd = await dotFile(runtimes)

    // Interprets the arguments and returns an array of shell commands
    const commands = parser(process.argv.splice(2))
    // Execute shell commands
    const results = runner(commands, cwd)
    const failed = results.filter(result => result.status !== 0)

    // The process's return code is the number of failed commands
    process.exit(failed.length)
  }
}

module.exports = greytape
