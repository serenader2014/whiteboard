export function responseTime() {
  return async function middleware(ctx, next) {
    const start = new Date().getTime()
    await next()
    const time = new Date().getTime() - start
    ctx.set('X-Response-Time', `${time}ms`)
  }
}
