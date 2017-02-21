import { User } from '../../model'
import { RecordNotFound } from '../../exceptions'

export async function createUser(ctx, next) {
  const { email, password } = ctx.request.body
  const newUser = await User.create({ email, password })
  ctx.body = newUser.structure(newUser)
}

export async function getUserInfo(ctx) {
  const targetUser = await User.query({ id: ctx.params.id })
  if (!targetUser) throw new RecordNotFound(`Can not find requested user: user ID: ${ctx.params.id}`)
  ctx.body = targetUser.structure(ctx.state.user)
}

export function getSelfInfo(ctx) {
  ctx.body = ctx.state.user.structure(ctx.state.user)
}
