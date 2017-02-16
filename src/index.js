import Koa from 'koa'
import bodyParser from 'koa-better-body'

import catcher from './middleware/catcher'
import responseTime from './middleware/response-time'

export default function() {
  const app = new Koa()

  app.use(catcher())
  app.use(responseTime())
  app.use(bodyParser())

  app.listen(8080)
}
