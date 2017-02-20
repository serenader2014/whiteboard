import { User } from '../../model'

export async function createUser(ctx, next) {
  const { email, password } = ctx.request.fields
  const newUser = await User.create({ email, password })
  ctx.body = newUser
}
