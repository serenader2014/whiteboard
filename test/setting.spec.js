import supertest from 'supertest'

import { createUser, login } from './utils'

const baseUrl = `http://localhost:${process.env.APP_PORT}`
describe('setting api test', () => {
  let settings = null
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
    const { user } = await createUser()
    const { agent } = await login(user)

    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/settings/${settings.id}`)
        .send({ value: 'user' })
        .end((err, res) => {
          if (err) return reject(err)
          console.log(res.body)
          res.status.should.equal(200)
          res.body.value.should.equal('user')
          resolve()
        })
    })
  })
})
