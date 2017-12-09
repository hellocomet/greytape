# Greytape

Greytape is a [Node.js](https://nodejs.org) library to create custom command line tools from shell commands. The original use case was to create helpers for a Docker development environment, but really anything that can be done in a shell can be integrated as a greytape command.

## Installation

Simply install `greytape` with `npm`...

```
npm install --save greytape
```

... and require it in your script :

```javascript
const greytape = require('greytape')
```

## Basic usage

At its simplest, greytape allows you to map your tool's commands to actual shell commands. Let's say you want to create an application named `cli` to manage your docker containers. `cli` could be used like this :

```
# cli up
// executes docker-compose up
# cli down
// docker-compose down
# cli api ssh
// ssh into the api container
# cli frontend build
// builds the frontend
```
With greytape, this would look like :

```javascript
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
```

## Advanced usage

### Arguments management

Greytape commands can handle arguments. You can specify defaults, and even manipulate the arguments before they are sent to the shell commands.

At minimum, you need to provide :
- `options` : an array of parameter names
- `commands` : instead of a string or array of strings, `commands` can be a function. It will be executed with the options provided by the user, and must return a string or an array of strings.

```javascript
greytape({
  __core: {
    data: {
      options: ['database'],
      commands: options => `psql -d ${options.database}`
    }
  },
})

```

See [the API reference](API.md#arguments-management) for advanced instructions.

### Taking the user to a different shell

Because greytape pipes stdin & stdout to the commands, you can take the user to a different shell, for example by connecting to a server with `ssh`, or by using any REPL like `node` or `psql` (see [previous example](#arguments-management)).

Doing this blocks the execution, so if you have provided an array of commands the next one won't execute until this process ends (for example when the user quits the shell).

### Executing commands in containers

For each greytape command, you can specify a Docker container name with the `inContainer` option. The command is executed inside the container by wrapping it with `docker exec -it <container> /bin/bash -c <command>`.

```javascript
greytape({
  data: {
    explore: {
      inContainer: 'db_container_1',
      commands: 'psql -d apidata'
    }
  }
})
```

### Configuration management

For the moment, the only configuration option available is `cwd`, which indicates the directory in which all commands will be executed. (Don't hesitate and just [raise an issue](https://github.com/hellocomet/greytape/issues) if you need other configuration options :) )

Greytape handles the configuration with a dotfile, located in your home folder, and named after the `__root` of your application (in our example, `~/.cli.json`). See [the API reference](API.md#__cwd) for more details.


## Self-documentation

Greytape can generate the documentation of your application if you provide a `__root` option, indicating the name of the application, and if your commands have hints indicating what they do.

Let's add some documentation to our `cli` application :

```javascript
const greytape = require('greytape')

greytape({
  // The application's name
  __root: 'cli',
  __core: {
    up: {
      // The hint for the up command
      hint: 'Starts the containers',
      commands: 'docker-compose up'
    },
    down: {
      hint: 'Stops the containers',
      commands: 'docker-compose down'
    },
    data: {
      hint: "Connect to a database",
      options: ['database'],
      commands: options => `psql -d ${options.database}`
    }
  },
  // The api prefix
  api: {
    ssh: {
      hint: 'SSH into the API container',
      commands: 'docker exec -it api_container /bin/bash'
    }
  }
  // The frontend prefix
  frontend: {
    build: {
      hint: 'Build the frontend with webpack',
      commands: ['cd ./frontend', 'npm run build']
    }
  }
})
```

The documentation can be accessed by calling `cli` with no arguments, or with `-h`, `--help` or `help`.

```
# cli -h
- Core commands
cli up : Starts the containers
cli down : Stops the containers
cli data [database] : Connect to a database
- api commands
cli api ssh : SSH into the API container
- frontend commands
cli frontend build : Build the frontend with webpack
```

## Installing your application

You can call a greytape application with `node cli.js command arguments` but in most cases you will want your application to be installed globally.

You simply need to add a `bin` section to your `package.json`, specifying the binary's name and the js file that should be executed :

```json
{
  "name": "cli",
  "version": "1.0.0",
  "description": "An example CLI application made with greytape.js",
  "bin": {
    "cli": "index.js"
  },
  "author": "Damien BUTY",
  "license": "MIT",
  "dependencies": {
    "greytape": "^0.5.0"
  }
}
```

Then go to your application's folder and `npm install -g` (you will probably need `sudo` privileges).

This makes the application accessible from anywhere in your system by creating a symlink in a folder of your PATH (in general `/usr/bin`).


