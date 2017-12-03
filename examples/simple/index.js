#!/usr/bin/env node

const greytape = require('../../src')

greytape({
  __root: 'simpleJack',
  __core: {
    logs: {
      hint: 'Get the application logs',
      commands: 'docker logs internal_api_container_1 -f'
    },
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
