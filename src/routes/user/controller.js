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

export async function deleteUser(ctx) {
  const { id } = ctx.params
  await ctx.api.deleteUser(id)
  ctx.body = { status: 'ok' }
}

export async function updateUserStatus(ctx) {
  const { id } = ctx.params
  const { status } = ctx.request.body
  const user = await ctx.api.updateUserStatus(id, status)
  ctx.body = user.json(true)
}

export async function updateUserRoles(ctx) {
  const { id } = ctx.params
  const roles = ctx.request.body.roles.split(',')

  const user = await ctx.api.changeUserRole(id, roles)
  ctx.body = user.json(true)
}

export async function changePassword() {

}

export async function getUserRoles(ctx) {
  const { id } = ctx.params
  ctx.body = await ctx.api.getUserRoles(id)
}
