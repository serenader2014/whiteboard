global.Promise = require('bluebird')
global.fs = global.Promise.promisifyAll(require('fs'))
require('babel-core/register')
require('./src/index').default()
