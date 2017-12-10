const rl = require('readline')
const fs = require('fs')
const os = require('os')

const prompts = rl.createInterface(process.stdin, process.stdout)

const dotFile = async runtimes => {
  let cwd = ''

  if (runtimes.__cwd) {
    if (runtimes.__cwd === 'DOTFILE') {
      const root = runtimes.__root
      const dotFile = `${os.homedir()}/.${root}.json`

      if (fs.existsSync(dotFile)) {
        const config = require(dotFile)
        cwd = config.cwd
      }
      else {
        await new Promise((resolve, reject) => {
          prompts.question(`Please enter the working directory for application ${root} : `, path => {
            if (fs.existsSync(path)) {
              fs.writeFile(dotFilePath, JSON.stringify({ cwd: path }), err => {
                if (err) {
                  reject(err)
                }
                resolve(path)
              })
            } else {
              reject()
            }
          })
        }).catch(e => {
          if (e) {
            console.error("There was an error while creating the dot file :")
            console.error(e)
          } else {
            console.error("The path you entered does not seem to exist. Exiting...")
          }
          process.exit(1)
        })
      }
    }
    else {
      cwd = runtimes.__cwd
    }
  }

  return cwd
}

module.exports = dotFile