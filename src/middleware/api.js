export function api() {
  const apis = require('../api/index')
  return async function middleware(ctx, next) {
    ctx.api = {}
    for (const i of Object.keys(apis)) {
      ctx.api[i] = {}
      for (const k of Object.keys(apis[i])) {
        ctx.api[i][k] = function(...args) {
          const requester = ctx.state.user || 'guest'
          return apis[i][k](requester, ...args)
        }
      }
    }

    await next()
  }
}
