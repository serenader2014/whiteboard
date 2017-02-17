import bookshelf from '../db/bookshelf'

export class Permission extends bookshelf.Model {
  get tableName () {
    return 'permissions'
  }
}
