export function requireAuthenticated() {
  return async function middleware(ctx, next) {
    if (ctx.isAuthenticated()) {
      await next()
    } else {
      ctx.body = {
        message: 'Not authenticated'
      }
      ctx.status = 401
    }
  }
}
