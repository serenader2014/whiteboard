import Koa from 'koa'
import convert from 'koa-convert'
import bodyParser from 'koa-better-body'
import session from 'koa-generic-session'
import redisStore from 'koa-redis'
import passport from 'koa-passport'
import bunyanLogger from 'koa-bunyan-logger'
import path from 'path'

import { catcher, responseTime, logger, api, view } from './middleware'
import routes from './routes'
import dbInit from './db/init'
import setUpPassport from './service/passport'
import { setUpPlugins } from './service/plugins'
import { setUpHelpers } from './client/helpers'
import { DBError } from './exceptions'

export default async function() {
  await dbInit()
  await setUpPlugins()
  await setUpHelpers()
  setUpPassport()

  const store = redisStore({ url: process.env.REDIS_URL })
  store.on('error', e => {
    throw new DBError('Connect to redis error')
  })

  const app = new Koa()
  app.keys = [process.env.SESSION_KEY]

  app.use(convert(bunyanLogger()))
  app.use(logger())
  app.use(convert(session({ store: store })))

  app.use(catcher())
  app.use(responseTime())
  app.use(convert(bodyParser({ fields: 'body' })))

  app.use(passport.initialize())
  app.use(passport.session())

  app.use(api())
  app.use(view({
    views: path.resolve(__dirname, 'client', 'views'),
    partialsDir: path.resolve(__dirname, 'client', 'views', 'partials')
  }))
  routes(app)

  app.listen(process.env.APP_PORT, () => console.log(`Server started on ${process.env.APP_PORT}`))

  app.on('error', e => console.log('error:' + e.message))
}
