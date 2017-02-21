export function requireUnauthenticated() {
  return async function middleware(ctx, next) {
    if (ctx.isUnauthenticated()) {
      await next()
    } else {
      ctx.body = {
        message: 'Already authenticated'
      }
      ctx.status = 400
    }
  }
}
