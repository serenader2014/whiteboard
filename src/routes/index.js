import glob from 'glob'
import Router from 'koa-router'
import _ from 'lodash'

import plugins from '../service/plugins'

export default function routes(app) {
  glob(`${__dirname}/*`, { ignore: '**/index.js' }, (err, matches) => {
    if (err) throw err
    const instance = new Router()
    app.context.router = instance

    matches.forEach(module => {
      const router = require(`${module}/router`)
      const baseUrl = router.baseUrl
      const routes = router.default

      Object.keys(routes).forEach(path => {
        routes[path].forEach(config => {
          const {
            method = '',
            handlers = [],
            name
          } = config

          const lastHandler = handlers.pop()
          async function saveRouterInfoToCtx(ctx, next) {
            ctx.locals.router = {
              ..._.pick(ctx.request, ['method', 'url', 'headers']),
              name
            }
            await next()
          }
          const args = [`${baseUrl}${path}`, saveRouterInfoToCtx, ...handlers, async ctx => await lastHandler(ctx)]
          if (name) {
            args.unshift(name)
          }

          instance[method.toLowerCase()](...args)
        })
      })
    })
    app.use(instance.routes())
    app.use(instance.allowedMethods())
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
