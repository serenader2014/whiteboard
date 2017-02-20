import Checkit from 'checkit'

export default function catcher() {
  return async function middleware(ctx, next) {
    try {
      await next()
    } catch (e) {
      if (e instanceof Checkit.Error) {
        ctx.status = 422
        ctx.body = {
          message: 'Field validation failed',
          errorType: 'validation',
          errors: e.toJSON()
        }
      } else {
        console.error('catch an error:')
        console.trace(e)
        ctx.body = e.message || e
      }
    }
  }
}

