export function api() {
  const apis = require('../api/index')
  return async function middleware(ctx, next) {
    ctx.api = {}
    for (const i of Object.keys(apis)) {
      ctx.api[i] = function(...args) {
        const requester = ctx.state.user || 'guest'
        return apis[i](requester, ...args)
      }
    }

    await next()
  }
}
