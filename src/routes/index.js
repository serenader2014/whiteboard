import glob from 'glob'
import Router from 'koa-router'

export default function routes (app) {
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
}
