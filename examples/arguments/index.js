#!/usr/bin/env node

const greytape = require('../../src')

greytape({
  __root: 'simpleJack',
  __core: {
    logs: {
      hint: 'Get the application logs',
      commands: 'docker logs internal_api_container_1 -f'
    },
    ssh: {
      hint: 'SSH into container (default: api)',
      // Options is an array of strings, containing the list of possible arguments
      options: [ 'container' ],
      // It is turned into a { key: value } object, and populated first with the defaults,
      // then with the input from the user
      defaults: { container: 'api' },
      // It is then passed to argumentsMap, where we can manipulate it as we see fit
      // in this example, we turn the easily remembered "api" and "frontend" arguments
      // into actual container names
      argumentsMap: (arguments) => {
        if (arguments.container === 'api') {
          return { container: 'internal_api_container_1' }
        }
        else if (arguments.container === 'frontend') {
          return { container: 'frontend_container_1' }
        }
        // The arguments mapper has the option to throw an error if the arguments provided are invalid
        else { throw "Invalid parameter <container>" }
      },
      commands: ({ container }) => `docker exec -it ${container} /bin/bash`
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
