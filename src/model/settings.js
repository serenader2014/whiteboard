import bookshelf from '../db/bookshelf'

export default class Setting extends bookshelf.Model {
  get tableName() {
    return 'settings'
  }
}
