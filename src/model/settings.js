import bookshelf from '../db/bookshelf'

export class Setting extends bookshelf.Model {
  get tableName() {
    return 'settings'
  }

  static get defaultFields() {
    return {
      created_by: 0,
      created_at: new Date()
    }
  }
}
