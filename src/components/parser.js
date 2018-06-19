const parse = (runtimes, cliArgs) => {
    const [ domainName ] = cliArgs

    if (!domainName) {
      console.error('No command')
      process.exit(1)
    }

    if (!runtimes[domainName] && !runtimes.__core[domainName]) {
      console.error(`${domainName} is neither a domain nor core command`)
      process.exit(1)
    }

    const domain = runtimes[domainName]
      ? runtimes[domainName]
      : runtimes.__core

    const command = runtimes[domainName]
      ? cliArgs[1]
      : cliArgs[0]

    if (!domain[command]) {
      const commandHint = runtimes[domainName] ? `command for domain ${domainName}` : 'core command'
      console.error(`${command} is not a valid ${commandHint}`)
      process.exit(1)
    }

    const args = runtimes[domainName]
      ? cliArgs.slice(2)
      : cliArgs.slice(1)

    // If the command is an alias, resolve it
    const { alias } = domain[command]
    if (alias) {
      const [ aliasDomain, aliasCommand ] = alias.split(':').length > 1
        ? alias.split(':')
        : [ '__core', alias ]

      if (!runtimes[aliasDomain][aliasCommand]) {
        console.error(`${alias} is not a valid alias`)
        process.exit(1)
      }

      return { runtime: runtimes[aliasDomain][aliasCommand], args }
    }

    return { runtime: domain[command], args }
}

module.exports = parse
