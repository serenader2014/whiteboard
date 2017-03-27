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

  it('try to update post', async () => {
    const { agent } = await login(global.admin)
    const targetPost = global.posts[0]
    const newPostInfo = {
      title: 'updated post title',
      content: 'hello world, this is updated content',
      status: 'draft',
      category_id: global.categories[0].id,
      featured: false
    }

    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/posts/${targetPost.id}`)
        .send(newPostInfo)
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          res.body.title.should.equal(newPostInfo.title)
          resolve()
        })
    })
  })
})
