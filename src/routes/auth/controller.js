import passport from 'koa-passport'

import { BadPassword } from '../../exceptions'

export function login(ctx, next) {
  return passport.authenticate('local', async (user, info, status) => {
    if (!user) throw new BadPassword(info.message)
    await ctx.login(user)
    ctx.body = user.structure(user)
  })(ctx, next)
}

export function logout(ctx) {
  ctx.logout()
  ctx.body = {
    message: 'ok'
  }
}
