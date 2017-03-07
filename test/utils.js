import dotenv from 'dotenv'
import path from 'path'
import Promise from 'bluebird'
import fs from 'fs'
import supertest from 'supertest'

export function setUpEnv() {
  global.Promise = Promise
  global.fs = global.Promise.promisifyAll(fs)
  dotenv.config({ path: path.resolve(__dirname, '../test.env') })
}

export async function setUpDB() {
  const dbConfig = JSON.parse(process.env.DB_CONFIG)
  if (dbConfig.client === 'sqlite3') {
    try {
      await fs.unlinkAsync(path.join(__dirname, '..', dbConfig.connection.filename))
    } catch (e) {
      if (e.code !== 'ENOENT') throw e
    }
  }
}

export function randomString(length) {
  if (length < 1) return ''
  const str = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('')
  return `${str[Math.round(Math.random() * length)]}${randomString(length - 1)}`
}

export function generatePassword(length) {
  const type = [
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '0123456789',
    '$@$!%*#?&'
  ]
  function randomKey(str) {
    return str[Math.floor(Math.random() * str.length)]
  }

  return type.reduce((arr, item) => arr.concat(randomKey(item)), [])
  .concat(
    new Array(length - type.length)
    .fill('')
    .map(() => randomKey(type[Math.floor(Math.random() * type.length)]))
    )
  .sort(() => Math.random() > 0.5).join('')
}

export function generateUserInfo() {
  return {
    email: `${randomString(8)}@domain.com`,
    password: generatePassword(16)
  }
}

export function createUser() {
  return new Promise((resolve, reject) => {
    const user = generateUserInfo()
    supertest(`http://localhost:${process.env.APP_PORT}`)
      .post('/api/v1/register')
      .send(user)
      .end((err, res) => {
        if (err) return reject(err)
        resolve({ user, response: res.body })
      })
  })
}

export function login(user) {
  return new Promise((resolve, reject) => {
    const agent = supertest.agent(`http://localhost:${process.env.APP_PORT}`)

    agent
      .post('/api/v1/login')
      .send(user)
      .end((err, res) => {
        if (err) return reject(err)
        resolve({ user, agent })
      })
  })
}

export async function insertInitialData() {
  const User = require('../src/model/users').User
  const Role = require('../src/model/roles').Role
  const Roles = require('../src/model/roles').Roles
  const Settings = require('../src/model/settings').Settings
  const adminInfo = {
    email: 'admin@test.com',
    password: 'helloworld',
    username: 'admin',
    created_at: new Date(),
    created_by: 0
  }
  const userInfo = {
    email: 'user@test.com',
    password: 'helloworld',
    username: 'user',
    created_at: new Date(),
    created_by: 0
  }
  const admin = await new User(adminInfo).save()
  const user = await new User(userInfo).save()

  adminInfo.id = admin.id
  userInfo.id = user.id

  const roles = await user.roles().fetch()
  await user.roles().detach(roles.models)
  const userRole = await Role.query({ name: 'user' })
  await user.roles().attach(userRole)

  const rolesList = await Roles.query({})
  const settings = await Settings.query({})
  global.admin = adminInfo
  global.user = userInfo
  global.roles = rolesList.toJSON()
  global.settings = settings.toJSON()
}
