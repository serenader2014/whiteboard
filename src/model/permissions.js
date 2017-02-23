import bookshelf from '../db/bookshelf'
import { Role } from './index'

export class Permission extends bookshelf.Model {
  get tableName() {
    return 'permissions'
  }

  static get defaultFields() {
    return {
      created_by: 0,
      created_at: new Date()
    }
  }

  role() {
    return this.belongsToMany(Role)
  }
}

export class Permissions extends bookshelf.Collection {
  get model() {
    return Permission
  }
}
