const config = {
  data: {
    production: {
      host: 'production-server.com',
      user: 'neil',
      db: 'apollo'
    },
    staging: {
      host: 'staging-server.com',
      user: 'neil',
      db: 'apollo'
    },
    local: {
      host: 'localhost',
      user: 'postgres',
      db: 'apollo'
    }
  },
  folder: {
    api: './api',
    frontend: './frontend',
    hub: './hub'
  },
  container: {
    api: 'api_1',
    frontend: 'frontend_1',
    hub: 'hub_1',
    data: 'db_1',
    rethinkdb: 'rethinkdb_1',
    redis: 'redis_1'
  }
}

module.exports = config