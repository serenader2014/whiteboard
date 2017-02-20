import bookshelf from '../db/bookshelf'

export class Setting extends bookshelf.Model {
  get tableName() {
    return 'settings'
  }

  static query(queryObject, options) {
    return this.forge()
    .query('where', queryObject)
    .fetch(options)
  }

  static create(options) {
    return this.forge(options).save()
  }
}
