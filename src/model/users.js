import bcrypt from 'bcrypt-nodejs'

import { Slug } from './slug'

import bookshelf from '../db/bookshelf'
import { Role } from './roles'
import UserField from '../service/validator/user-field'

const crypt = Promise.promisifyAll(bcrypt)
const userSlug = new Slug('user')

export class User extends bookshelf.Model {
  get tableName() {
    return 'users'
  }

  static get defaultFields() {
    return {
      status: 'active',
      language: 'zh',
      created_at: new Date(),
      created_by: 0,
      username: fields => fields.username || fields.email
    }
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

  static async generatePassword(password) {
    const salt = await crypt.genSaltAsync(8)
    return crypt.hashAsync(password, salt, null)
  }

  async onSaving(model, attrs, options) {
    const { email, password, username } = model.attributes

    await new UserField({ email, password, username }, true).execute()
    const hashedPassword = await User.generatePassword(password)
    const slug = await userSlug.digest(username)
    model.set('password', hashedPassword)
    model.set('slug', slug)
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
