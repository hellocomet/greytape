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
    const dotFile = require('./components/dotfile')
    const cwd = await dotFile(runtimes)

    // Interprets the arguments and returns an array of shell commands
    const commands = parser(process.argv.splice(2))
    // Execute shell commands
    runner(commands, cwd)
  }
}

module.exports = greytape
