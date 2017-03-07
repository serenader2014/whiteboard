import supertest from 'supertest'

import { login } from './utils'

const baseUrl = `http://localhost:${process.env.APP_PORT}`
describe('setting api test', () => {
  it('unauthenticated user try to list settings', done => {
    supertest(baseUrl)
      .get('/api/v1/settings')
      .end((err, res) => {
        if (err) throw err
        res.status.should.equal(401)
        done()
      })
  })

  it('admin list setting', async () => {
    const { agent } = await login(global.admin)

    return new Promise((resolve, reject) => {
      agent
        .get(`/api/v1/settings`)
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          resolve()
        })
    })
  })

  it('should update default role setting', async () => {
    const { agent } = await login(global.admin)
    const setting = global.settings.filter(item => item.key === 'default_role')[0]
    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/settings/${setting.id}`)
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
    const { agent } = await login(global.user)

    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/users/${global.admin.id}`)
        .send({ bio: 'testbio' })
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(403)
          resolve()
        })
    })
  })

  it('common user update himself userinfo', async () => {
    const { agent } = await login(global.user)

    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/users/${global.user.id}`)
        .send({ bio: 'commonuser bio' })
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          res.body.bio.should.equal('commonuser bio')
          resolve()
        })
    })
  })
})
