import { post } from '../../api'

export async function mainChannel(ctx) {
  let { page } = ctx.params
  page = page ? Number(page) : 1

  const posts = await post.listPublishedPosts('guest', {
    pageSize: ctx.locals.coreSettings.post_per_page,
    page
  }, ctx.locals.coreSettings.home_page_channel)

  const nextPage = page >= posts.meta.pageCount ? null : `/page/${page + 1}`
  const prevPage = page <= 1 ? null : `/page/${page - 1}`

  await ctx.render('index.hbs', {
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
  const { slug } = ctx.params
  const postData = await post.get('guest', { slug }, ['user', 'category'])

  await ctx.render('post.hbs', {
    post: postData.toJSON()
  })
}
