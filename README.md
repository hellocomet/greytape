# Greytape

Greytape is a Node.js library to create simple command line tools from shell commands. The original use case was to create helpers for development environments with Docker containers, but really anything that can be done in a shell can be integrated in a greytape command.

## Installation

Simply install `greytape` with `npm`...

```
npm install --save greytape
```

... and require it in your script :

```javascript
const greytape = require('greytape')
```

## Usage

To create a command line tool, simply initialize Greytape with a valid `runtime`. A runtime describes a list of domains and commands, which are mapped to shell commands. The resulting CLI application will be used with the following pattern :

```
$ # <bin>      <domain>     <command>     <args>
$ my_cli_tool  some_domain  some_command  --some arguments with --or -without-dashes

```

### Basic example

Here's an example of a simple runtime :

```javascript
// index.js
const greytape = require('greytape')

greytape({
	// The first level is a domain
	internalApi: {
    	// All items on the second level are commands
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
```

It exposes one domain `internalApi` with 3 commands `start`, `stop` and `restart` :

```
$ node index.js internalApi start
$ node index.js internalApi stop
$ node index.js internalApi restart
```

A command should have at minimum a hint (used for the help section of your application), and a command. Note that the `commands` property can contain a String or an Array of Strings. If it is an array, the commands are executed one after the other.

### The __core domain

The `__core` domain is a reserved domain, that contains the "root" commands of your application. These commands can be reached directly without specifying a domain.

For example the following runtime:

```javascript
// index.js
greytape({
  __core: {
    logs: {
      hint: 'Get the application logs',
      commands: 'docker logs internal_api_container_1 -f'
    }
  }
})
```

will be used like this : `node index.js logs`

## Advanced usage

### Arguments management

Greytape allows you to add arguments to a command, to specify defaults for these arguments, and to manipulate these arguments before they are passed to the shell commands.

This is done using three additional blocks: `options`, `defaults` and `argumentsMap`. Consider the following command, which allows to ssh inside a chosen docker container :

```javascript
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
  // The result of argumentsMap is then passed to the function that creates the shell command
  commands: (mappedArguments) => `docker exec -it ${mappedArguments.container} /bin/bash`
}
```

Note that in this case, commands is a function. It is called with the result of argumentsMap, and can return either a String or an Array of Strings.

### Executing commands inside containers

Greytape gives you the possibility to execute commands directly inside docker containers. For this, you only need to set the option `inContainer` on the command :

```javascript
// index.js
greytape({
	data: {
      migrate: {
        hint: 'Executes the Sequelize migrations',
        inContainer: 'internal_api_container_1',
        commands: 'cd api && npm run migrate'
      }
    }
})

```

The command will be wrapped with `docker exec -it <container_name> <provided_command>`

### Taking the user to a different shell

All executed commands inherit stdio from the node process, which means that you can take your user to a different shell (SSHing into a server, into a docker container, or a command line REPL like psql).

The following instructions work as expected :

```javascript
greytape({
	ssh: {
    	production: {
        	hint: 'SSH into the production server',
            commands: 'ssh -i ~/.ssh/id_rsa root@prod.server.co'
        },
        dev: {
        	hint: 'SSH into the development container',
            commands: 'docker exec -it internal_api_container_1 /bin/bash'
        }
    },
    data: {
    	explore: {
        	hint: 'Log inside PSQL in the db container',
            inContainer: 'db_container_1',
            commands: 'su postgres -c psql -d my_database'
        }
    }
})
```

## Self-documentation

Thanks to the hints you provided, your application is capable of self-documenting. The documentation can be accessed either by calling the application without arguments, or by calling it with `help`, `--help` or `-h`.

The only additional configuration needed is the `__root` key, to indicate the name of your application.

For example, this runtime :

```javascript
// index.js
greytape({
  __root: 'simplejack',
  __core: {
    logs: {
      hint: 'Get the application logs',
      commands: 'docker logs internal_api_container_1 -f'
    },
    ssh: {
      hint: 'SSH into container (default: api)',
      options: [ 'container' ],
      defaults: { container: 'api' },
      argumentsMap: (arguments) => {
        if (arguments.container === 'api') {
            return { container: 'internal_api_container_1' }
        }
        else if (arguments.container === 'frontend') {
            return { container: 'frontend_container_1' }
        }
        else { throw "Invalid parameter <container>" }
      },
      commands: (mappedArguments) => `docker exec -it ${mappedArguments.container} /bin/bash`
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
```

will produce this documentation :

```
$ node index.js -h
- Core commands
simpleJack logs : Get the application logs
simpleJack ssh [container] : SSH into container (default: api)
- internalApi commands
simpleJack internalApi start : Starts the API's Docker container
simpleJack internalApi stop : Stops the API's Docker container
simpleJack internalApi restart : Restarts the API's Docker container
```
