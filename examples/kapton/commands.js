
const factory = config => ({
  __root: 'kapton',
  __cwd: 'DOTFILE',
  __core: {
    build: {
      hint: 'Build the docker-compose cluster',
      commands: 'docker-compose build'
    },
    up: {
      alias: '__core:start'
    },
    down: {
      alias: '__core:stop'
    },
    start: {
      hint: 'Start the docker-compose cluster',
      commands: 'docker-compose up -d'
    },
    stop: {
      hint: 'Stop the docker-compose cluster',
      commands: 'docker-compose down'
    },
    restart: {
      hint: 'Stop the docker-compose cluster',
      commands: 'docker-compose down && docker-compose up -d'
    },
    logs: {
      hint: 'Displays logs for [container] (default : api). "-f" to follow.',
      options: [ 'container', 'follow' ],
      defaults: {
        container: 'api',
        follow: '-f'
      },
      argumentsMap: ({ container, follow }) => ({
        container: config.container[container],
        follow: follow === '-f' || follow === 'follow'
          ? true
          : false
      }),
      commands: ({ container, follow }) => `docker logs ${container} ${ follow ? '-f' : '' }`
    },
    ssh: {
      hint: 'SSH into container (default: api)',
      options: [ 'container' ],
      defaults: { container: 'api' },
      argumentsMap: ({ container }) => ({
        container: config.container[container]
      }),
      commands: ({ container }) => `docker exec -it ${container} /bin/bash`
    }
  },
  data: {
    explore: {
      hint: 'Log into the PostgreSQL console',
      inContainer: config.container['data'],
      commands: 'su postgres -c "psql -d comet"'
    },
    dump: {
      hint: '(<source>:<destination>) : dumps the database from source and restores it on destination. Source can be "production" or "staging", destination can be "staging" or "local"',
      inContainer: config.container['data'],
      options: [ 'direction' ],
      defaults: {
        direction: 'staging:local'
      },
      argumentsMap: ({ direction }) => {
        const [ source, destination ] = direction.split(":")

        return {
          source: config.data[source],
          destination: config.data[destination]
        }
      },
      commands: ({ source, destination }) => [
        `pg_dump -h ${source.host} -U ${source.user} -d ${source.db} -W -c > /tmp/dump.sql`,
        `psql -h ${destination.host} -U ${destination.user} -d ${destination.db} -f /tmp/dump.sql`
      ]
    },
    migrate: {
      hint: 'Executes the Sequelize migrations',
      inContainer: config.container['api'],
      commands: 'cd api && npm run migrate'
    },
    createMigration: {
      hint: 'Creates a new empty Sequelize migration',
      inContainer: config.container['api'],
      commands: 'cd api && npm run migration:create'
    }
  },
  git: {
    branches: {
      hint: 'Show what branch each component is on',
      commands: () => [
        'echo    "Component | Branch  "',
        'echo    "==========|=======  "',
        'echo -n "Galaxy    : " && git rev-parse --abbrev-ref HEAD',
        `echo -n "API       : " && cd ${config.folder.api} && git rev-parse --abbrev-ref HEAD`,
        `echo -n "Frontend  : " && cd ${config.folder.frontend} && git rev-parse --abbrev-ref HEAD`,
        `echo -n "Hub       : " && cd ${config.folder.hub} && git rev-parse --abbrev-ref HEAD`
      ]
    },
    pull: {
      hint: 'Check out the develop branch and pull it for [targets]. If [targets] is empty, check out all 3 projects.',
      options: [ 'targets' ],
      defaults: {
        targets: ['api', 'frontend', 'hub']
      },
      argumentsMap: ({ targets }) => targets.map(target => config.folder[target]),
      commands: ({ targets }) => targets.map(
        target => `cd ${target} && git checkout develop && git pull`
      )
    }
  },
})

module.exports = factory