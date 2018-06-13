   const compose = (runtime, args) => {    
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
    const defaults = runtime.defaults || {}

    // If the runtime doesn't specify options, we just pass the defaults if any
    // Otherwise we map the user's input to a { key: value } object
    const options = !runtime.options
      ? defaults
      : {
        ...defaults,
        ...runtime.options.reduce((acc, option, idx) => {
          if (args[idx]) {
            acc[option] = args[idx] || null
          }
          return acc
        }, {})
      }

    // If an arguments mapper is provided, map the arguments
    // Otherwise just pass the options
    try {
      const mappedArguments = !runtime.argumentsMap
        ? options
        : runtime.argumentsMap(options)

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
    } catch(e) {
      console.error(`Arguments could not be interpreted : ${e}`)
      process.exit(1)
    }
  }

module.exports = compose
