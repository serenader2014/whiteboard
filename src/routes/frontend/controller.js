import { setting, post } from '../../api'

export async function homePage(ctx) {
  const settings = await setting.listAll({ context: 'internal' }, { type: 'blog' })
  const blogSettings = settings.toJSON().reduce((obj, item) => {
    obj[item.key] = item.value
    return obj
  }, {})
  const posts = await post.listPublishedPosts({ context: 'internal' }, { pageSize: blogSettings.post_per_page })
  await ctx.render('index.hbs', {
    settings: blogSettings,
    posts: posts.data,
    pagination: {
      page: posts.meta.page,
      totalPage: posts.meta.pageCount,
      totalPosts: posts.meta.rowCount
    }
  })
}
