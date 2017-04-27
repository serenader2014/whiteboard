import { setting, post } from '../../api'

export async function mainChannel(ctx) {
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

  let { page } = ctx.params
  page = page ? Number(page) : 1

  const posts = await post.listPublishedPosts('guest', {
    pageSize: coreSettings.post_per_page,
    page
  }, channel)

  const nextPage = page >= posts.meta.pageCount ? null : `/page/${page + 1}`
  const prevPage = page <= 1 ? null : `/page/${page - 1}`

  await ctx.render('index.hbs', {
    settings: blogSettings,
    posts: posts.data,
    pagination: {
      page: posts.meta.page,
      totalPage: posts.meta.pageCount,
      totalPosts: posts.meta.rowCount
    },
    link: {
      nextPage,
      prevPage
    }
  })
}

export async function postDetail(ctx) {
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

  const { slug } = ctx.params
  const postData = await post.get('guest', { slug }, ['user', 'category'])

  await ctx.render('post.hbs', {
    settings: blogSettings,
    post: postData.toJSON()
  })
}
