import Checkit from 'checkit'

export function catcher() {
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
        ctx.status = e.status || 500
        ctx.body = {
          message: e.message || e,
          errorType: 'Internal server error'
        }
      }
    }
  }
}

