import bookshelf from '../db/bookshelf'

import { Permission, User } from './index'

export class Role extends bookshelf.Model {
  get tableName() {
    return 'roles'
  }

  static get defaultFields() {
    return {
      created_by: 0,
      created_at: new Date()
    }
  }

  users() {
    return this.belongsToMany(User)
  }

  permissions() {
    return this.belongsToMany(Permission)
  }
}
