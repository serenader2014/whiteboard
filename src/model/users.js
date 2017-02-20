import bcrypt from 'bcrypt-nodejs'
import _ from 'lodash'

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

  static async generatePassword(password) {
    const salt = await crypt.genSaltAsync(8)
    return crypt.hashAsync(password, salt, null)
  }

  static async create(options) {
    const defaultOption = {
      status: 'active',
      language: 'zh',
      created_at: new Date(),
      created_by: 0
    }
    const user = _.extend({}, defaultOption, options)
    user.username = user.username || user.email
    user.slug = await userSlug.digest(user.username)

    return this.forge(user).save()
  }

  async onCreating(model, attrs, options) {
    const { email, password, username } = model.attributes

    await new UserField({ email, password, username }, true).execute()
    const hashedPassword = await User.generatePassword(password)
    model.set('password', hashedPassword)
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

