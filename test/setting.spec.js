import supertest from 'supertest'

import { createUser, login } from './utils'

const baseUrl = `http://localhost:${process.env.APP_PORT}`
describe('setting api test', () => {
  let settings = null
  let adminUser = null
  let commonUser = null
  let commonUserSession = null
  it('should list settings', done => {
    supertest(baseUrl)
      .get('/api/v1/settings')
      .end((err, res) => {
        if (err) throw err
        res.status.should.equal(200)
        settings = res.body
        done()
      })
  })

  it('should update default role setting', async () => {
    const { user, response } = await createUser()
    const { agent } = await login(user)
    adminUser = response
    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/settings/${settings.id}`)
        .send({ value: 'user' })
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          res.body.value.should.equal('user')
          resolve()
        })
    })
  })

  it('should try to update admin user info', async () => {
    const { user, response } = await createUser()
    const { agent } = await login(user)

    commonUser = response
    commonUserSession = agent

    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/users/${adminUser.id}`)
        .send({ bio: 'testbio' })
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(403)
          resolve()
        })
    })
  })

  it('common user update himself userinfo', done => {
    commonUserSession
      .put(`/api/v1/users/${commonUser.id}`)
      .send({ bio: 'commonuser bio' })
      .end((err, res) => {
        if (err) throw err
        res.status.should.equal(200)
        res.body.bio.should.equal('commonuser bio')
        done()
      })
  })
})
