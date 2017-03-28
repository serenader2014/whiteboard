import glob from 'glob'
import Router from 'koa-router'

import { plugins } from '../service/plugins'

export default function routes(app) {
  glob(`${__dirname}/*`, { ignore: '**/index.js' }, (err, matches) => {
    if (err) throw err

    matches.forEach(module => {
      const router = require(`${module}/router`)
      const baseUrl = router.baseUrl
      const routes = router.default
      const instance = new Router({ prefix: baseUrl })

      Object.keys(routes).forEach(path => {
        routes[path].forEach(config => {
          const {
            method = '',
            handlers = []
          } = config

          const lastHandler = handlers.pop()

          instance[method.toLowerCase()](path, ...handlers, async ctx => await lastHandler(ctx))

          app.use(instance.routes())
          app.use(instance.allowedMethods())
        })
      })
    })
  })

  const routesList = plugins.getRoutesList()
  for (const route of routesList) {
    const instance = new Router({ prefix: `/plugins/${route.plugin.pkg.name}` })
    for (const method of Object.keys(route.handlers)) {
      instance[method](route.path, async ctx => await route.handlers[method](ctx))
      app.use(instance.routes())
      app.use(instance.allowedMethods())
    }
  }
}
