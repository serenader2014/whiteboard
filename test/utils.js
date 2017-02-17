import dotenv from 'dotenv'
import path from 'path'
import Promise from 'bluebird'
import fs from 'fs'

export function setUpEnv() {
  global.Promise = Promise
  global.fs = global.Promise.promisifyAll(fs)
  dotenv.config({ path: path.resolve(__dirname, '../test.env') })
}

export async function setUpDB() {
  const dbConfig = JSON.parse(process.env.DB_CONFIG)
  if (dbConfig.client === 'sqlite3') {
    try {
      await fs.unlinkAsync(path.join(__dirname, '..', dbConfig.connection.filename))
    } catch (e) {
      if (e.code !== 'ENOENT') throw e
    }
  }
}
