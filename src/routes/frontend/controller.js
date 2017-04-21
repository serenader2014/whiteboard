import { setting } from '../../api'

export async function homePage(ctx) {
  const settings = await setting.listAll({ context: 'internal' }, { type: 'blog' })
  const blogSettings = settings.toJSON().reduce((obj, item) => {
    obj[item.key] = item.value
    return obj
  }, {})
  await ctx.render('index.hbs', {
    settings: blogSettings
  })
}
