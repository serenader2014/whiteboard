import supertest from 'supertest'

describe('User api test', () => {
  it('try to create a new user', done => {
    const request = supertest(`http://localhost:${process.env.APP_PORT}/users`)
    request
      .post('/')
      .send({ email: 'test@test.com', password: 'he!loworld@' })
      .expect(200, done)
  })
})
