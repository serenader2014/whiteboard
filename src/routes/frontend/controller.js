import { setting, post } from '../../api'

export async function homePage(ctx) {
  const settings = await setting.listAll({ context: 'internal' })
  const blogSettings = {}
  const coreSettings = {}
  settings.toJSON().forEach((item) => {
    if (item.type === 'blog') {
      blogSettings[item.key] = item.value
    } else if (item.type === 'core') {
      coreSettings[item.key] = item.value
    }
  })
  let channel

  if (coreSettings.home_page_channel === 'all') {
    channel = 'all'
  } else {
    try {
      channel = JSON.parse(coreSettings.home_page_channel)
    } catch (e) {
      channel = 'all'
    }
  }

  const posts = await post.listPublishedPosts({
    context: 'internal'
  }, {
    pageSize: coreSettings.post_per_page
  }, channel)
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
