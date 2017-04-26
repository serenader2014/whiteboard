import supertest from 'supertest'

import { login, createPost, getRandomPost } from './utils'
const baseUrl = `http://localhost:${process.env.APP_PORT}`

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
    const targetPost = await getRandomPost({ status: 'published' })
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

  it('unpublished post can be reached by author', async () => {
    const { agent, post } = await createPost('draft', global.categories[0].id, global.user)

    return new Promise((resolve, reject) => {
      agent
        .get(`/api/v1/posts/${post.id}`)
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          resolve()
        })
    })
  })

  it('unpublished post can be reached by admin', async () => {
    const { post } = await createPost('draft', global.categories[0].id, global.user)
    const { agent } = await login(global.admin)

    return new Promise((resolve, reject) => {
      agent
        .get(`/api/v1/posts/${post.id}`)
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          resolve()
        })
    })
  })

  it('unpublished post can not be reached by other user', async () => {
    const { post } = await createPost('draft')
    const { agent } = await login(global.user)
    return new Promise((resolve, reject) => {
      agent
        .get(`/api/v1/posts/${post.id}`)
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(404)
          resolve()
        })
    })
  })

  let draft = null
  it('unpublished post can not be reached by guest', async () => {
    const { post } = await createPost('draft')
    draft = post
    return new Promise((resolve, reject) => {
      supertest(baseUrl)
        .get(`/api/v1/posts/${post.id}`)
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(404)
          resolve()
        })
    })
  })

  it('publish a draft', async () => {
    const { agent } = await login(global.admin)

    return new Promise((resolve, reject) => {
      agent
        .put(`/api/v1/posts/${draft.id}`)
        .send(Object.assign({}, draft, { status: 'published' }))
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          supertest(baseUrl)
            .get(`/api/v1/posts/${draft.id}`)
            .end((err, res) => {
              if (err) return reject(err)
              res.status.should.equal(200)
              resolve()
            })
        })
    })
  })

  it('list posts', done => {
    supertest(baseUrl)
      .get('/api/v1/posts')
      .end((err, res) => {
        if (err) throw err
        res.body.data.length.should.above(0)
        done()
      })
  })

  it('list draft', async () => {
    const { agent } = await createPost('draft', global.categories[0].id, global.user)
    return new Promise((resolve, reject) => {
      agent
        .get('/api/v1/posts/drafts')
        .end((err, res) => {
          if (err) return reject(err)
          res.body.data.length.should.equal(3)
          resolve()
        })
    })
  })

  it('admin list draft', async () => {
    const { agent } = await login(global.admin)
    return new Promise((resolve, reject) => {
      agent
        .get('/api/v1/posts/drafts')
        .end((err, res) => {
          if (err) return reject(err)
          res.body.data.length.should.equal(6)
          resolve()
        })
    })
  })

  it('list post with pagination', async function() {
    this.timeout(5000)
    await createPost('published')
    await createPost('published')
    await createPost('published')
    await createPost('published')
    await createPost('published')
    return new Promise((resolve, reject) => {
      supertest(baseUrl)
        .get('/api/v1/posts')
        .end((err, res) => {
          if (err) return reject(err)
          res.body.meta.rowCount.should.equal(6)
          supertest(baseUrl)
            .get('/api/v1/posts?pageSize=5&page=2')
            .end((err, res) => {
              if (err) return reject(err)
              res.body.data.length.should.equal(1)
              resolve()
            })
        })
    })
  })

  it('list post with relation data', done => {
    supertest(baseUrl)
      .get('/api/v1/posts?include=category')
      .end((err, res) => {
        if (err) throw err
        res.body.data[0].category.id.should.not.equal(undefined)
        supertest(baseUrl)
          .get('/api/v1/posts?include=user')
          .end((err, res) => {
            if (err) throw err
            res.body.data[0].user.id.should.not.equal(undefined)
            supertest(baseUrl)
              .get('/api/v1/posts?include=user,category')
              .end((err, res) => {
                if (err) throw err
                res.body.data[0].category.id.should.not.equal(undefined)
                res.body.data[0].user.id.should.not.equal(undefined)
                done()
              })
          })
      })
  })

  it('create a post draft', async () => {
    const targetPost = await getRandomPost({ status: 'published' })
    const { agent } = await login(global.admin)
    const draft = Object.assign({}, targetPost, {
      title: targetPost.title + '_updated_at_' + new Date().getTime(),
      content: targetPost.content + '\nupdated_at_' + new Date().getTime(),
      featured: false
    })

    return new Promise((resolve, reject) => {
      agent
        .post(`/api/v1/posts/${targetPost.id}/drafts`)
        .send(draft)
        .end((err, res) => {
          if (err) return reject(err)
          res.status.should.equal(200)
          agent
            .get(`/api/v1/posts/${targetPost.id}/drafts`)
            .end((err, res) => {
              if (err) return reject(err)
              res.status.should.equal(200)
              res.body.meta.rowCount.should.equal(1)
              resolve()
            })
        })
    })
  })
})
