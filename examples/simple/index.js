#!/usr/bin/env node

const greytape = require('../../src')

greytape({
  __root: 'simpleJack',
  __cwd: 'DOTFILE',
  __core: {
    logs: {
      hint: 'Get the application logs',
      commands: 'docker logs internal_api_container_1 -f'
    },
    ssh: {
      options: ['user', 'server'],
      defaults: {
        user: 'root',
        server: 'production'
      },
      argumentsMap: ({ user, server }) => {
        if (server === 'production') {
          return {
            user,
            server: 'prod.boring.url.eu-frankfurt-1.cloud.co'
          }
        }
        else if (server === 'staging') {
          return {
            user,
            server: 'staging.boring.url.eu-frankfurt-1.cloud.co'
          }
        }
        
		    throw `Unrecognized server '${server}'`
      },
      commands: ({ user, server }) => `echo ${user}@${server}`
    }
  },
	internalApi: {
    start: {
        hint: 'Starts the API\'s Docker container',
        commands: 'docker start internal_api_container_1'
      },
      stop: {
        hint: 'Stops the API\'s Docker container',
        commands: 'docker stop internal_api_container_1'
      },
      restart: {        
        hint: 'Restarts the API\'s Docker container',
        commands: [
          'docker stop internal_api_container_1',
          'docker start internal_api_container_1'
        ]
      }
  }	
})
