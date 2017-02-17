import supertest from 'supertest'
import { should } from 'chai'
import { setUpEnv } from './utils'

should()

describe('Auth', () => {
  before(async () => {
    setUpEnv()
    await require('../src/index').default()
  })

  it('should ok', done => {
    const request = supertest(`http://localhost:${process.env.APP_PORT}`)
    request.get('/').expect(404, done)
  })
})
