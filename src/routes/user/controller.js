export async function createUser(ctx, next) {
  const { email, password } = ctx.request.body

  const newUser = await ctx.api.user.create({ email, password })
  ctx.body = newUser.json(true)
}

export async function getUserInfo(ctx) {
  ctx.body = await ctx.api.user.getInfo(ctx.params.id)
}

export function getSelfInfo(ctx) {
  ctx.body = ctx.state.user.json(true)
}

export async function updateUserInfo(ctx) {
  const { id } = ctx.params

  const user = await ctx.api.user.updateInfo(id, ctx.request.body)
  ctx.body = user.json(true)
}

export async function deleteUser(ctx) {
  const { id } = ctx.params
  await ctx.api.user.del(id)
  ctx.body = { status: 'ok' }
}

export async function deactivateUser(ctx) {
  const { id } = ctx.params
  const user = await ctx.api.user.updateStatus(id, 'inactive')
  ctx.body = user.json(true)
}

export async function activateUser(ctx) {
  const { id } = ctx.params
  const user = await ctx.api.user.updateStatus(id, 'active')
  ctx.body = user.json(true)
}

export async function updateUserRoles(ctx) {
  const { id } = ctx.params
  const roles = (ctx.request.body.roles || '').toString().split(',')

  const user = await ctx.api.user.changeRole(id, roles)
  ctx.body = user.json(true)
}

export async function changePassword(ctx) {
  const { oldPassword, newPassword } = ctx.request.body
  const { id } = ctx.params

  const user = await ctx.api.user.changePassword(id, oldPassword, newPassword)
  ctx.body = user.json(true)
}

export async function getUserRoles(ctx) {
  const { id } = ctx.params
  ctx.body = await ctx.api.user.getRoles(id)
}

export async function listUsers(ctx) {
  ctx.body = await ctx.api.user.list()
}

export async function getUserInfoByEmail(ctx) {
  const { email } = ctx.params
  ctx.body = await ctx.api.user.getByEmail(email)
}

export async function getUserInfoBySlug(ctx) {
  const { slug } = ctx.params
  ctx.body = await ctx.api.user.getBySlug(slug)
}
