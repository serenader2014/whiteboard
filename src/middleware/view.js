import hbs from 'express-hbs'
import path from 'path'

import { TemplateError } from '../exceptions'

export function view(options) {
  const renderer = hbs.express4(options)
  return async function middleware(ctx, next) {
    ctx.render = function(filename, data) {
      const locals = {
        settings: {
          ...options
        },
        ...data
      }
      const file = path.resolve(options.views, filename)
      return new Promise((resolve, reject) => {
        renderer(file, locals, (err, str) => {
          if (err) return reject(new TemplateError(err.message))
          ctx.body = str
          resolve()
        })
      })
    }
    await next()
  }
}
