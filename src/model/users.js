import bcrypt from 'bcrypt-nodejs'

import { Slug } from './slug'

import bookshelf from '../db/bookshelf'
import { Role, Setting } from './index'
import UserField from '../service/validator/user-field'
import { DBError, RecordNotFound } from '../exceptions'

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

  static async getActiveUser(queryObject) {
    const user = await this.query(queryObject)

    if (!user || user.get('status') === 'deleted') {
      throw new RecordNotFound('Can not find target user')
    }

    if (user.get('status') === 'inactive') {
      throw new RecordNotFound('User is in inactive status')
    }

    return user
  }

  static async generatePassword(password) {
    const salt = await crypt.genSaltAsync(8)
    return crypt.hashAsync(password, salt, null)
  }

  async onCreated(model, attrs, options) {
    const setting = await Setting.query({ key: 'default_role' })
    if (!setting) throw new DBError('Setting is incomplete, no default role record')

    const defaultRole = setting.get('value')
    const role = await Role.query({ name: defaultRole })
    if (!role) throw new DBError('No default role record found')
    await model.roles().attach(role)
  }

  async onUpdating(model, attrs, options) {
    const { password, username } = model.attributes
    if (model.hasChanged(['email', 'username', 'password', 'status'])) {
      await new UserField(model.attributes, model.hasChanged('email'), !model.hasChanged('password')).execute()
    }

    if (model.hasChanged('password')) {
      const hashedPassword = await User.generatePassword(password)
      model.set('password', hashedPassword)
    }

    if (model.hasChanged('username')) {
      const slug = await userSlug.digest(username)
      model.set('slug', slug)
    }
  }

  async onCreating(model, attrs, options) {
    const { password, username } = model.attributes

    await new UserField(model.attributes, true).execute()
    const hashedPassword = await User.generatePassword(password)
    const slug = await userSlug.digest(username)

    model.set('password', hashedPassword)
    model.set('slug', slug)
  }

  async permissions() {
    const roles = await this.roles().fetch({ withRelated: 'permissions' })
    let permissions = []

    roles.each(role => {
      permissions = [...permissions, ...role.toJSON().permissions]
    })

    return permissions
  }

  roles() {
    return this.belongsToMany(Role)
  }

  validatePassword(password) {
    return crypt.compareAsync(password, this.get('password'))
  }

  login() {
    this.set('last_login', new Date())
    return this.save()
  }
}

export class Users extends bookshelf.Collection {
  get model() {
    return User
  }
}
