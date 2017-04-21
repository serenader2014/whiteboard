import supertest from 'supertest'

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

  it('get user info by email', async () => {
    const { response } = await createUser()

    return new Promise((resolve, reject) => {
      supertest(baseUrl)
        .get(`/api/v1/users/email/${response.email}`)
        .end((err, res) => {
          if (err) return reject(err)
          res.body.email.should.equal(response.email)
          resolve()
        })
    })
  })

  it('get user info by slug', async () => {
    const { response } = await createUser()

    return new Promise((resolve, reject) => {
      supertest(baseUrl)
        .get(`/api/v1/users/slug/${response.slug}`)
        .end((err, res) => {
          if (err) return reject(err)
          res.body.slug.should.equal(response.slug)
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

  it('admin change other user role to common user', async () => {
    const { agent } = await login(global.admin)
    const { response } = await createUser()
    const targetRole = global.roles.filter(item => item.name === 'user')[0].id

    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/users/${response.id}/roles`)
        .send({ roles: targetRole })
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          agent
            .get(`/api/v1/users/${response.id}/roles`)
            .end((err, r) => {
              if (err) return reject(err)
              r.body.length.should.equal(1)
              r.body[0].name.should.equal('user')
              resolve()
            })
        })
    })
  })

  it('admin change other user role to admin user', async () => {
    const { agent } = await login(global.admin)
    const { response } = await createUser()
    const targetRole = global.roles.filter(item => item.name === 'admin')[0].id

    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/users/${response.id}/roles`)
        .send({ roles: targetRole })
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          agent
            .get(`/api/v1/users/${response.id}/roles`)
            .end((err, r) => {
              if (err) return reject(err)
              r.body.length.should.equal(1)
              r.body[0].name.should.equal('admin')
              resolve()
            })
        })
    })
  })

  it('common user try to change other user role', async () => {
    const { agent } = await login(global.user)
    const { response } = await createUser()
    const targetRole = global.roles.filter(item => item.name === 'admin')[0].id

    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/users/${response.id}/roles`)
        .send({ roles: targetRole })
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(403)
          resolve()
        })
    })
  })

  it('user try to change password', async function() {
    this.timeout(5000)
    const { response, user } = await createUser()
    const { agent } = await login(user)
    const newPassword = 'newpassword!'

    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/users/${response.id}/password`)
        .send({ oldPassword: user.password, newPassword: newPassword })
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          supertest(baseUrl)
            .post('/api/v1/login')
            .send({ email: user.email, password: newPassword })
            .end((err, r) => {
              if (err) return reject(err)
              r.status.should.equal(200)
              resolve()
            })
        })
    })
  })

  it('user try to change password using an invalid old password', async () => {
    const { response, user } = await createUser()
    const { agent } = await login(user)
    const newPassword = 'newpassword!'

    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/users/${response.id}/password`)
        .send({ oldPassword: newPassword, newPassword: newPassword })
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(401)
          supertest(baseUrl)
            .post('/api/v1/login')
            .send({ email: user.email, password: newPassword })
            .end((err, r) => {
              if (err) return reject(err)
              r.status.should.equal(401)
              resolve()
            })
        })
    })
  })

  it('guest get user list', done => {
    supertest(baseUrl)
      .get('/api/v1/users')
      .end((err, res) => {
        if (err) throw err
        res.status.should.equal(401)
        done()
      })
  })

  it('common user get user list', async () => {
    const { agent } = await login(global.user)
    return new Promise((resolve, reject) => {
      agent
        .get('/api/v1/users')
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(403)
          resolve()
        })
    })
  })

  it('admin get user list', async () => {
    const { agent } = await login(global.admin)
    return new Promise((resolve, reject) => {
      agent
        .get('/api/v1/users')
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          res.body.meta.rowCount.should.above(16)
          resolve()
        })
    })
  })
})
