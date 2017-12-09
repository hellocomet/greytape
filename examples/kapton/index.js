#!/usr/bin/env node

const config = require('./config')
const commands = require('./commands')(config)

const greytape = require('greytape')

greytape(commands)
