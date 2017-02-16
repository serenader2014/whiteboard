import User from '../../model/users'

export async function createUser(ctx, next) {
  const { email, password } = ctx.request.fields
  await User.create({ email, password, username: email })
  ctx.body = 'hello world'
}

