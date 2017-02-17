import dotenv from 'dotenv'
import path from 'path'
import Promise from 'bluebird'
import fs from 'fs'

export function setUpEnv () {
  global.Promise = Promise
  global.fs = global.Promise.promisifyAll(fs)
  dotenv.config({ path: path.resolve(__dirname, '../test.env') })
}
