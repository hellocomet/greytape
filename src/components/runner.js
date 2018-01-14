
const { spawnSync } = require('child_process')

// Loop on commands and spawn a process for each one, inheriting stdio
const run = (commands, cwd) => commands.map(command => {
  const bin = command.split(" ").shift()
  const args = command.split(" ").splice(1)

  // We spawn them synchronously to ensure commands are called one after the other
  return spawnSync(bin, args, { stdio: "inherit", cwd, shell: true })
})

module.exports = run
