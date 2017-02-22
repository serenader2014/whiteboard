import supertest from 'supertest'

import { generateUserInfo, createUser, login } from './utils'

const baseUrl = `http://localhost:${process.env.APP_PORT}`

describe('User api test', () => {
  const user = generateUserInfo()
  it('try to create a new user', done => {
    supertest(baseUrl)
      .post('/api/v1/users')
      .send(user)
      .expect(200, done)
  })

  it('try to create duplicate user', done => {
    supertest(baseUrl)
      .post('/api/v1/users')
      .send(user)
      .expect(422, done)
  })

  it('try to use an invalid email to create user', done => {
    supertest(baseUrl)
      .post('/api/v1/users')
      .send({ email: 'invalidemail', password: 'he!loworld@' })
      .expect(422, done)
  })

  it('try to use a short password to create user', done => {
    supertest(baseUrl)
      .post('/api/v1/users')
      .send({ email: 'test1@test.com', password: '123' })
      .expect(422, done)
  })

  it('try to update user info', async () => {
    const { user, response } = await createUser()
    const { agent } = await login(user)
    const userInfo = {
      bio: 'a new bio'
    }
    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/users/${response.id}`)
        .send(userInfo)
        .end((err, res) => {
          if (err) return reject(err)
          resolve()
        })
    })
  })
})
