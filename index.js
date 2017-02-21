global.Promise = require('bluebird')
global.fs = global.Promise.promisifyAll(require('fs'))
require('babel-core/register')
require('dotenv').config()
require('./src/index').default().catch(e => {
  console.error(`Server catch an unhandled error: ${e.message || e}`)
  console.log(e.stack)
})
