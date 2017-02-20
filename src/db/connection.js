import knex from 'knex'
import path from 'path'

import ensureFolderExist from '../utils/ensure-folder-exist'
import { DBError } from '../exceptions'

let dbConfig

try {
  dbConfig = JSON.parse(process.env.DB_CONFIG)
} catch (e) {
  throw new DBError('Can not parse database config')
}

if (dbConfig.client === 'sqlite3') {
  dbConfig.connection.filename = path.join(__dirname, '../..', dbConfig.connection.filename)
  ensureFolderExist(path.dirname(dbConfig.connection.filename))
}

export default knex(dbConfig)
