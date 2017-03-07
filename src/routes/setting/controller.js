export async function listSetting(ctx) {
  const settings = await ctx.api.setting.list()
  ctx.body = settings.toJSON()
}

export async function updateSetting(ctx) {
  const { id } = ctx.params
  const setting = await ctx.api.setting.update(id, ctx.request.body)
  ctx.body = setting.json(true)
}
