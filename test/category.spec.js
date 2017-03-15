import { login } from './utils'

describe('category api test', () => {
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
})
