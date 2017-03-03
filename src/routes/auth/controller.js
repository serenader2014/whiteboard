import passport from 'koa-passport'
import { User } from '../../model'

import { BadPassword } from '../../exceptions'

export function login(ctx, next) {
  return passport.authenticate('local', async (user, info, status) => {
    if (!user) throw new BadPassword(info.message)
    await ctx.login(user)
    await user.login()
    ctx.body = user.json(true)
  })(ctx, next)
}

export function logout(ctx) {
  ctx.logout()
  ctx.body = {
    message: 'ok'
  }
}

export async function register(ctx) {
  const { email, password } = ctx.request.body
  const newUser = await User.create({ email, password })
  ctx.body = newUser.json(true)
}
