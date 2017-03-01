export async function createUser(ctx, next) {
  const { email, password } = ctx.request.body

  const newUser = await ctx.api.createUser({ email, password })
  ctx.body = newUser.json(true)
}

export async function getUserInfo(ctx) {
  ctx.body = await ctx.api.getUserInfo(ctx.params.id)
}

export function getSelfInfo(ctx) {
  ctx.body = ctx.state.user.json(true)
}

export async function updateUserInfo(ctx) {
  const { id } = ctx.params

  const user = await ctx.api.updateUserInfo(id, ctx.request.body)
  ctx.body = user.json(true)
}
