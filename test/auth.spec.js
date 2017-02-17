import supertest from 'supertest'

describe('Auth', () => {
  it('should ok', done => {
    const request = supertest(`http://localhost:${process.env.APP_PORT}`)
    request.get('/').expect(200, done)
  })
})
