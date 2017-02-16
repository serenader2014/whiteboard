import Koa from 'koa'
import bodyParser from 'koa-better-body'
import session from 'koa-generic-session'
import redisStore from 'koa-redis'
import passport from 'koa-passport'
import logger from 'koa-bunyan-logger'

import catcher from './middleware/catcher'
import responseTime from './middleware/response-time'

import routes from './routes'

import dbInit from './db/init'

export default async function() {
  await dbInit()

  const app = new Koa()
  app.keys = [process.env.SESSION_KEY]

  app.use(logger())
  app.use(session({
    store: redisStore({ url: process.env.REDIS_URL })
  }))

  app.use(catcher())
  app.use(responseTime())
  app.use(bodyParser())

  app.use(passport.initialize())
  app.use(passport.session())

  routes(app)

  app.listen(process.env.APP_PORT, () => console.log(`Server started on ${process.env.APP_PORT}`))
}
