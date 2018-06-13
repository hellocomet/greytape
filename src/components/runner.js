
const { spawnSync } = require('child_process')

// Loop on commands and spawn a process for each one, inheriting stdio
const run = (commands, cwd, debug) => {
  for (let command of commands) {
    const bin = command.split(" ").shift()
    const args = command.split(" ").splice(1)
    if (debug) { console.log(command) }
    const result = spawnSync(bin, args, { stdio: ["inherit", "inherit", "inherit"], cwd, shell: true })
    if (result.status !== 0) {
      // If a command fails, break the loop and return with its status code
      return result.status
    }
  }

  // No command has failed, return with 0
  return 0
}

module.exports = run
