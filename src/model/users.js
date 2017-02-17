import bcrypt from 'bcrypt-nodejs'

import bookshelf from '../db/bookshelf'
import Role from './roles'
import UserField from '../service/validator/user-field'

const crypt = Promise.promisifyAll(bcrypt)

export class User extends bookshelf.Model {
  get tableName() {
    return 'users'
  }

  static checkIfExist(obj) {
    return this.forge()
    .query(queryBuilder => {
      queryBuilder
      .where('email', obj.email || '')
      .orWhere('username', obj.username || '')
    })
    .fetch()
  }

  static query(queryObject, options) {
    return this.forge()
    .query('where', queryObject)
    .fetch(options)
  }

  static create(user) {
    return this.forge(user)
    .save()
  }

  onCreating(model, attrs, options) {
    const { email, password, username } = model.attributes

    return new UserField({ email, password, username }, true).execute()
  }

  roles() {
    return this.belongsTo(Role, 'role_id')
  }

  validatePassword(password) {
    return crypt.compareAsync(password, this.get('password'))
  }

  login() {
    this.set('last_login', new Date())
    return this.save()
  }
}

