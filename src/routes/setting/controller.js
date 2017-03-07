export async function listSettings(ctx) {
  const settings = await ctx.api.setting.list()
  ctx.body = settings.toJSON()
}

export async function updateSetting(ctx) {
  const { id } = ctx.params
  const setting = await ctx.api.setting.update(id, ctx.request.body)
  ctx.body = setting.json(true)
}

export async function getSetting(ctx) {
  const { id } = ctx.params
  const setting = await ctx.api.setting.get(id)
  ctx.body = setting.json(true)
}
