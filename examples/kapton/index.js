#!/usr/bin/env node

const config = require('./config')
const commands = require('./commands')(config)

const greytape = require('../../src')

greytape(commands)
