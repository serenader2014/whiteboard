import bookshelf from '../db/bookshelf'

export class Setting extends bookshelf.Model {
  get tableName () {
    return 'settings'
  }
}
