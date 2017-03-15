import supertest from 'supertest'

import { login } from './utils'

const baseUrl = `http://localhost:${process.env.APP_PORT}`

describe('category api test', () => {
  it('should get a category', done => {
    const targetCategory = global.categories[0]
    supertest(baseUrl)
      .get(`/api/v1/categories/${targetCategory.id}`)
      .end((err, res) => {
        if (err) throw err
        res.body.name.should.equal(targetCategory.name)
        done()
      })
  })

  it('should try to create category', async () => {
    const { agent } = await login(global.admin)
    const newCategory = 'hello world'

    return new Promise((resolve, reject) => {
      agent
        .post('/api/v1/categories')
        .send({ name: newCategory })
        .end((err, res) => {
          if (err) return reject(err)

          res.body.name.should.equal(newCategory)
          resolve()
        })
    })
  })

  it('should list categories', done => {
    supertest(baseUrl)
      .get('/api/v1/categories')
      .end((err, res) => {
        if (err) throw err
        res.body.length.should.equal(global.categories.length + 1)
        done()
      })
  })
})
