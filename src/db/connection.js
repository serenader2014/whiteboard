import knex from 'knex'
import path from 'path'

import ensureFolderExist from '../utils/ensure-folder-exist'

const dbConfig = JSON.parse(process.env.DB_CONFIG)

if (dbConfig.client === 'sqlite3') {
  dbConfig.connection.filename = path.join(__dirname, '../..', dbConfig.connection.filename)
  ensureFolderExist(path.dirname(dbConfig.connection.filename))
}

export default knex(dbConfig)
