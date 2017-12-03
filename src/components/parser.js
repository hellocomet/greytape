 
const parserFactory = runtimes => {
  const parser = cliArgs => {
    let [ domain, command, ...args ] = cliArgs
    
    let runtime
  
    /**
     * Identify the domain and the command
     */
    if (!domain || !runtimes[domain]) {
      if (!runtimes.__core[domain]) {
        console.error('Unknown domain')
        process.exit(1)
      } else {
        // If the domain can't be found, then it might be a _core function
        // In this case the command is actually the first argument
        runtime = runtimes.__core[domain]
        args.unshift(command)
      }
    } else {
      const available = runtimes[domain]
    
      if (!available[command]) {
        console.error(`Unknown command for ${domain}`)
      } else {
        runtime = available[command]
      }
    }
    
    // If this command is an alias, then we map to the actual command
    if (runtime.alias) {
      try {
        const aliasDomain = runtime.alias.split(":")[0]
        const aliasCommand = runtime.alias.split(":")[1]
    
        runtime = runtimes[aliasDomain][aliasCommand]
      } catch (e) {
        console.error("Something went wrong with an alias!")
        console.error(e)
        process.exit(1)
      }
    }
    
    // Create defaults object
    const defaults = Object.assign({}, runtime.defaults || {})
    let options
    
    // Turn the options array into a { key: value } object with the defaults applied
    if (runtime.options) {
      options = Object.assign(
        {},
        defaults,
        runtime.options.reduce((acc, option, idx) => {
          if (args[idx]) {
            acc[option] = args[idx]
          }
          return acc
        }, {})
      )
    } else {
      options = defaults
    }
    
    // If an arguments mapper is provided, map the arguments
    let mappedArguments = {}
    if (runtime.argumentsMap) {
      try {
        mappedArguments = runtime.argumentsMap(options)
      } catch(e) {
        console.error("Arguments could not be interpreted : ")
        console.error(e)
        process.exit(1)
      }
    }

    let { commands } = runtime

    // Commands can be a string, an array of strings or a function
    // If it's a function, we execute it with the mapped arguments
    if (typeof commands === 'function' || commands instanceof Function) {
      commands = commands(mappedArguments)
    }
    
    // If commands is not an array at this point, turn it into one
    commands = Array.isArray(commands) ? commands : [commands]

    if (runtime.inContainer) {
      const container = runtime.inContainer
      commands = commands.map(command => `docker exec -it ${container} /bin/bash -c ${command}`)
    }

    return commands
  }

  return parser
}

module.exports = parserFactory
