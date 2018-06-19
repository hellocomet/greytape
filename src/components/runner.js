
const { spawn } = require('child_process')

// Loop on commands and spawn a process for each one, inheriting stdio
const run = async (commands, cwd, debug) => {
  const spawner = (bin, args) => {
    return new Promise((resolve, reject) => {
      const process = spawn(bin, args, { stdio: "inherit", cwd, shell: true })
  
      process.on('close', code => {
        if (code !== 0) { reject(code) }
        else { resolve(0) }
      })
    })
  }

  for (let command of commands) {
    const bin = command.split(" ").shift()
    const args = command.split(" ").splice(1)
    if (debug) { console.log(command) }
    await spawner(bin, args, cwd)
  }

  // No command has failed, return with 0
  return 0
}

module.exports = run

// [process.stdin, process.stdout, process.stderr]