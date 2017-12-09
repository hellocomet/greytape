#!/usr/bin/env node

const greytape = require('greytape')

// The configuration is passed as an object to greytape
greytape({
  // The __core block contains the commands that don't have a prefix
  __core: {
    up: { commands: 'docker-compose up' },
    down: { commands: 'docker-compose down' },
  },
  // The api prefix
  api: {
    ssh: { commands: 'docker exec -it api_container /bin/bash' }
  },
  // The frontend prefix
  frontend: {
  	// commands can be supplied as an array, they are executed sequentially and synchronously
    build: { commands: ['cd ./frontend', 'npm run build'] }
  }
})
