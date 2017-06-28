import glob from 'glob'
import Router from 'koa-router'
import _ from 'lodash'
import path from 'path'
import send from 'koa-send'

import plugins from '../service/plugins'

export default function routes(app) {
  const apiRouter = new Router()
  apiRouter.all(/^\/api\/v1(?:\/|$)/, async function(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', '*')
    if (ctx.method === 'OPTIONS') {
      ctx.body = 'ok'
    }
    await next()
  })

  app.use(apiRouter.routes())

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
              ..._.pick(ctx.request, ['method', 'url', 'headers', 'ip']),
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

  const adminRouter = new Router()
  adminRouter.all(/^\/admin(?:\/|$)/, async function(ctx) {
    const clientBaseDir = path.join(__dirname, '../../client/dist')
    if (path.extname(ctx.path)) {
      // requesting an static assets(javascript files or css file or html file)
      await send(ctx, ctx.path, { root: clientBaseDir })
    } else {
      await send(ctx, 'index.html', { root: clientBaseDir })
    }
  })

  app.use(adminRouter.routes())
}
