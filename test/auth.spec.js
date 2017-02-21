import supertest from 'supertest'

const baseUrl = `http://localhost:${process.env.APP_PORT}`

describe('Auth', () => {
  const userInfo = {
    email: 'newemail@test.com',
    password: 'helloworld'
  }
  it('should create a new user', done => {
    supertest(baseUrl)
      .post('/api/v1/users')
      .send(userInfo)
      .expect(200, done)
  })

  const agent = supertest.agent(baseUrl)
  it('should try to login', done => {
    agent
      .post('/api/v1/login')
      .send(userInfo)
      .expect(200, done)
  })

  it('should show current user info', done => {
    agent
      .get('/api/v1/users/self')
      .end((err, res) => {
        if (err) throw err
        res.body.email.should.equal(userInfo.email)
        done()
      })
  })

  it('should show empty user', done => {
    supertest(baseUrl)
      .get('/api/v1/users/self')
      .expect(401, done)
  })

  it('should try to logout', done => {
    agent
      .get('/api/v1/logout')
      .expect(200, done)
  })

  it('should show empty user', done => {
    agent
      .get('/api/v1/users/self')
      .expect(401, done)
  })
})
