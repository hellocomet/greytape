# Greytape API Reference

## Base configuration

```javascript
const greytape = require('greytape')

greytape({
  __root: 'testcli',
  __cwd: 'DOTFILE',
  __core: {
  	// Core domain commands
  },
  // Other domains & commands
})

```

#### __root

_String_

The name of your CLI application. It is used to generate the documentation & the name of the config file.

#### ___cwd

_String_

The working directory for your application. The cwd can be :

- an absolute path (no `../` or `~`) 
- the value 'DOTFILE'
  -  in this case, the value is taken from a JSON config file
  -  the config file lives in your home dir, and is named after your application's __root : `~/.<__root>.json`
  -  if the file does not exist, greytape will prompt the user for the cwd and create the config file

```
# node index.js
Please enter the working directory for application testcli : /home/damso/dev
# cat ~/.testcli.json
{"cwd":"/home/damso/dev"}
```

#### ___core

The `__core` block is special: it contains the "root" commands of your application. These commands can be reached directly without a prefix.

For example in the following runtime, the `logs` command is accessible with `node index.js logs`

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

## Block configuration

#### commands

The commands that will be executed. The value can be :

- A string
- An array of strings
- A function returning a string
- A function returning an array of strings

If `commands` is a function, it is called with one parameter, the result of `argumentsMap` (_see arguments management_).

```javascript
greytape({
  __core: {
  	aString: {
      commands: 'cd .. && ls'
    },
    anArray: {
      commands: ['cd ..', 'ls']
    },
    aStringFunction: {
      // ...Arguments mgmt omitted
      commands: (options) => `cd ${options.folder} && ls`
    },
    anArrayFunction: {
      // ...Arguments mgmt omitted
      commands: (options) => [`cd ${options.folder}`, 'ls']
    }
  }
})

```

#### alias

_String_

Used to create command aliases. Must be set to `prefix:command`. If the aliased command is in the `__core` block, the `__core` prefix must be specified.

```javascript
greytape({
  __core: {
    up: {
      alias: '__core:start'
    },
    start: {
      hint: 'Start the docker-compose cluster',
      commands: 'docker-compose up -d'
    }
  }
})
```

#### hint

_String_

A brief description of what the command does. The hints are used to generate the documentation of your application.

#### inContainer

_String_

The command will be executed inside this container. In effect, it will be wrapped with `docker exec -it <container> /bin/bash -c <command>`.

```javascript
greytape({
  data: {
    explore: {
      hint: 'Log into the PostgreSQL console',
      inContainer: 'db_container_1',
      commands: 'su postgres -c "psql -d comet"'
    }
  }
})
```

## Arguments management

Greytape allows you to add an arbitrary number of parameters to your commands. You can specify defaults for these parameters, and optionally manipulate them before they are sent to the commands.

This is done in three steps :

#### options

_Array_

Options is an array containing the names of your various parameters.

```javascript
// index.js
greytape({
  __core: {
    hack: {
      options: ['user', 'server'],
      commands: options => `echo ${JSON.stringify(options)}`
    }
  }
})

```

The user provided parameters are taken in the order of the array, and mapped to a `{ key: value }` object. In this example, the `['user', 'server']` array maps to `{ user: '<user input>', server: '<user input>' }`.

```
#                   |user| |server |
# node index.js hack  root   nsa.gov
{
  user: "root",
  server: "nsa.gov"
}
```

#### defaults

_Object_

Defaults is used, well, to provide default values when a parameter is not input by the user. They should be specified in the `{ key: value }` format

```javascript
// index.js
greytape({
  __core: {
    hack: {
      options: ['user', 'server'],
      defaults: {
        user: 'admin',
        server: 'nsa.org'
      },
      commands: ({ user, server }) => `ssh ${user}@${server}`
    }
  }
})

```

```
# node index.js hack
// ssh admin@nsa.org
```

#### argumentsMap

Sometimes you might want to avoid repeating long and hard to remember paramters like server names and paths. The argumentsMap makes it easy for you. Basically, it's a function that is executed with the parameters in `{ key: value }` format, and returns whatever suits your purpose. The result of `argumentsMap` is then used to execute the `commands` function.

The arguments mapper also doubles as an input validator : it has the option to `throw` an error which will be displayed to the user.

```javascript
// index.js
greytape({
  __core: {
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
        else {
          throw `Unrecognized server '${server}'`
        }
      },
      commands: ({ user, server }) => `ssh ${user}@${server}`
    }
  }
})

```

```
# node index.js ssh produser staging
// ssh produser@staging.long.complicated.url.eu-frankfurt-1.cloud.co
# node index.js ssh produser
// ssh produser@prod.long.complicated.url.eu-frankfurt-1.cloud.co
# node index.js ssh produser development
Arguments could not be interpreted : Unrecognized server 'development'
```
