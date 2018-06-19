
const document = runtimes => {
  const { __root } = runtimes

  const documentBlock = (block, domain) => {
    Object.keys(block).forEach(
      command => {
        const runtime = block[command]
        const options = runtime.options
          ? runtime.options.map(option => `[${option}]`).join(" ")
          : ""
        const hint = runtime.alias
          ? `(alias de ${runtime.alias})`
          : runtime.hint || "No documentation available"
  
        const executable = domain
          ? `${__root} ${domain}`
          : __root
  
        if (options) {
          console.log(`${executable} ${command} ${options} : ${hint}`)
        }
        else {
          console.log(`${executable} ${command} : ${hint}`)
        }
      }
    )
  }
  
  // Document core functions
  const usage = `USAGE : ${__root} [DOMAIN] COMMAND [ARGS...]`
  if (runtimes.__core) {
    console.log("- Core commands")
    documentBlock(runtimes.__core)
  }

  const ignoredKeys = ['__core', '__root', '__cwd', '__debug']

  // Document all other domains
  Object.keys(runtimes)
  .filter(domain => !ignoredKeys.includes(domain))
  .forEach(
    domain => {
      console.log(`- ${domain} commands`)
      documentBlock(runtimes[domain], domain)
    }
  )
}

module.exports = document
