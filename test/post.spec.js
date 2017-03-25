// import supertest from 'supertest'

import { login } from './utils'

describe('post api test', () => {
  it('try to create post', async () => {
    const { agent } = await login(global.admin)
    const postInfo = {
      title: 'this is a new post',
      content: 'hello world, this is the post content',
      status: 'draft',
      category_id: global.categories[0].id
    }

    return new Promise((resolve, reject) => {
      agent
        .post('/api/v1/posts')
        .send(postInfo)
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          resolve()
        })
    })
  })
})
