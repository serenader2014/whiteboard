import { User } from '../../model'
import { RecordNotFound } from '../../exceptions'

export async function createUser(ctx, next) {
  const { email, password } = ctx.request.fields
  const newUser = await User.create({ email, password })
  ctx.body = newUser.structure()
}

export async function getUserInfo(ctx) {
  const targetUser = await User.query({ id: ctx.params.id })
  if (!targetUser) throw new RecordNotFound(`Can not find requested user: user ID: ${ctx.params.id}`)
  ctx.body = targetUser.structure()
}
