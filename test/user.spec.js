import supertest from 'supertest'
import { expect } from 'chai'

import { generateUserInfo, createUser, login } from './utils'

const baseUrl = `http://localhost:${process.env.APP_PORT}`

describe('User api test', () => {
  const user = generateUserInfo()
  it('try to create a new user', done => {
    supertest(baseUrl)
      .post('/api/v1/register')
      .send(user)
      .expect(200, done)
  })

  it('try to create duplicate user', done => {
    supertest(baseUrl)
      .post('/api/v1/register')
      .send(user)
      .expect(422, done)
  })

  it('try to use an invalid email to create user', done => {
    supertest(baseUrl)
      .post('/api/v1/register')
      .send({ email: 'invalidemail', password: 'he!loworld@' })
      .expect(422, done)
  })

  it('try to use a short password to create user', done => {
    supertest(baseUrl)
      .post('/api/v1/register')
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
          res.body.bio.should.equal(userInfo.bio)
          resolve()
        })
    })
  })

  it('admin try to update other user info', async () => {
    const { response } = await createUser()
    const { agent } = await login(global.admin)
    const newUserInfo = {
      bio: 'bio updated by admin'
    }

    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/users/${response.id}`)
        .send(newUserInfo)
        .end((err, res) => {
          if (err) return reject(err)
          res.body.bio.should.equal(newUserInfo.bio)
          resolve()
        })
    })
  })

  it('common user try to update other user info', async () => {
    const { response } = await createUser()
    const { agent } = await login(global.user)
    const newUserInfo = {
      bio: 'bio updated by user'
    }

    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/users/${response.id}`)
        .send(newUserInfo)
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(403)
          resolve()
        })
    })
  })

  it('admin get user info', async () => {
    const { response } = await createUser()
    const { agent } = await login(global.admin)

    return new Promise((resolve, reject) => {
      agent
        .get(`/api/v1/users/${response.id}`)
        .end((err, res) => {
          if (err) return reject(err)
          res.body.status.should.not.equal(null)
          resolve()
        })
    })
  })

  it('common user get other user info', async () => {
    const { response } = await createUser()
    const { agent } = await login(global.user)

    return new Promise((resolve, reject) => {
      agent
        .get(`/api/v1/users/${response.id}`)
        .end((err, res) => {
          if (err) return reject(err)
          expect(res.body.status).to.equal(null)
          resolve()
        })
    })
  })

  it('admin try to delete user', async () => {
    const { user, response } = await createUser()
    user.id = response.id
    global.deletedUser = user
    const { agent } = await login(global.admin)

    return new Promise((resolve, reject) => {
      agent
        .delete(`/api/v1/users/${response.id}`)
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          agent
            .get(`/api/v1/users/${response.id}`)
            .end((err, r) => {
              if (err) return reject(err)
              r.status.should.equal(404)
              resolve()
            })
        })
    })
  })

  it('deleted user can not login', done => {
    supertest(baseUrl)
      .post('/api/v1/login')
      .send(global.deletedUser)
      .end((err, res) => {
        if (err) throw err
        res.status.should.equal(404)
        done()
      })
  })

  it('admin deactivate user', async () => {
    const { response, user } = await createUser()
    const { agent } = await login(global.admin)

    global.deactivatedUser = user
    global.deactivatedUser.id = response.id

    return new Promise((resolve, reject) => {
      agent
        .post(`/api/v1/users/${response.id}/deactivate`)
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          agent
            .get(`/api/v1/users/${response.id}`)
            .end((err, r) => {
              if (err) return reject(err)
              r.status.should.equal(404)
              resolve()
            })
        })
    })
  })

  it('common user try to deactivate user', async () => {
    const { response } = await createUser()
    const { agent } = await login(global.user)

    return new Promise((resolve, reject) => {
      agent
        .post(`/api/v1/users/${response.id}/deactivate`)
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(403)
          agent
            .get(`/api/v1/users/${response.id}`)
            .end((err, r) => {
              if (err) return reject(err)
              r.status.should.equal(200)
              resolve()
            })
        })
    })
  })

  it('deactivated user can not login', done => {
    supertest(baseUrl)
      .post('/api/v1/login')
      .send(global.deactivatedUser)
      .end((err, res) => {
        if (err) throw err
        res.status.should.equal(404)
        done()
      })
  })

  it('admin activate user', async () => {
    const { agent } = await login(global.admin)

    return new Promise((resolve, reject) => {
      agent
        .post(`/api/v1/users/${global.deactivatedUser.id}/activate`)
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          agent
            .get(`/api/v1/users/${global.deactivatedUser.id}`)
            .end((err, r) => {
              if (err) return reject(err)
              r.body.status.should.equal('active')
              resolve()
            })
        })
    })
  })
})
