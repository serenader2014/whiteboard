import supertest from 'supertest'

const baseUrl = `http://localhost:${process.env.APP_PORT}`

describe('User api test', () => {
  it('try to create a new user', done => {
    supertest(baseUrl)
      .post('/api/v1/users')
      .send({ email: 'test@test.com', password: 'he!loworld@' })
      .expect(200, done)
  })

  it('try to create duplicate user', done => {
    supertest(baseUrl)
      .post('/api/v1/users')
      .send({ email: 'test@test.com', password: 'he!loworld@' })
      .expect(422, done)
  })

  it('try to use an invalid email to create user', done => {
    supertest(baseUrl)
      .post('/api/v1/users')
      .send({ email: 'invalidemail', password: 'he!loworld@' })
      .expect(422, done)
  })

  it('try to use a short password to create user', done => {
    supertest(baseUrl)
      .post('/api/v1/users')
      .send({ email: 'test1@test.com', password: '123' })
      .expect(422, done)
  })
})
