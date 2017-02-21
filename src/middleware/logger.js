export function logger() {
  return async function middleware(ctx, next) {
    process.env.NODE_ENV !== 'test' && ctx.log.info('Got a request from %s for %s', ctx.request.ip, ctx.path)
    await next()
  }
}
