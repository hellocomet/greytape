#!/usr/bin/env node

const config = require('./config')
const runtimes = require('./runtimes')(config)

const greytape = require('../../src')

greytape(runtimes)
