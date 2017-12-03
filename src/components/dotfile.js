const rl = require('readline')
const fs = require('fs')
const os = require('os')

const prompts = rl.createInterface(process.stdin, process.stdout)

const dotFile = runtimes => {
  const root = runtimes.__root
  const dotFilePath = `${os.homedir()}/.${root}.json`

  return new Promise((resolve, reject) => {
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
  })

}

module.exports = dotFile