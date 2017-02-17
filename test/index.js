import supertest from 'supertest'
import { should } from 'chai'
import glob from 'glob'

import { setUpEnv, setUpDB } from './utils'

should()

describe('Whiteboard server api test', () => {
  before(async () => {
    setUpEnv()
    await setUpDB()
    await require('../src/index').default()
  })

  describe('check if server is running or not', () => {
    it('should receive 200', done => {
      supertest(`http://localhost:${process.env.APP_PORT}`)
        .get('/').expect(200, done)
    })
  })

  const matches = glob.sync(`${__dirname}/*.spec.js`)
  matches.forEach(test => require(test))
})
