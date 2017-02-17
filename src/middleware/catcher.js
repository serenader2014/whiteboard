export default function catcher () {
  return async function middleware (ctx, next) {
    try {
      await next()
    } catch (e) {
      console.error('catch an error:')
      console.trace(e)
      ctx.body = e.message || e
    }
  }
}

