#!/usr/bin/env node

const greytape = require('greytape')

const config = {
  container: {
    api: 'api_container_1',
    frontend: 'frontend_container_1'
  }
}

greytape({
  __root: 'simpleJack',
  __core: {
    logs: {
      hint: 'Displays logs for [container] (default : api). "-f" to follow.',
      // options contains the list of possible parameters
      options: [ 'container', 'follow' ],
      // default values if not provided by the user
      defaults: {
        container: 'api',
        follow: '-f'
      },
      // 
      argumentsMap: ({ container, follow }) => {
        if (config.container[container]) {
          return {
            container: config.container[container],
            follow: follow === '-f' || follow === 'follow'
              ? true
              : false
          }
        }
        throw "unknown container"
      },
      commands: ({ container, follow }) => `docker logs ${container} ${ follow ? '-f' : '' }`
    }
  }
})
