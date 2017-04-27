import _ from 'lodash'

export async function getPost(ctx) {
  const { id } = ctx.params
  const { include } = ctx.query
  const post = await ctx.api.post.get({ id }, (include || '').split(','))

  ctx.body = post.json()
}

export async function listPost(ctx) {
  const options = _.pick(ctx.query, ['pageSize', 'page', 'order', 'filter', 'include'])

  const posts = await ctx.api.post.listPublishedPosts(options)

  ctx.body = posts
}

export async function updatePost(ctx) {
  const { id } = ctx.params
  const post = await ctx.api.post.update(id, ctx.request.body)

  ctx.body = post.json()
}

export async function createPost(ctx) {
  const postObject = _.extend({}, ctx.request.body, {
    user_id: ctx.state.user.id
  })
  const post = await ctx.api.post.create(postObject)

  ctx.body = post.json()
}

export async function createDraft(ctx) {
  const originalId = ctx.params.id
  const postObject = _.extend({}, ctx.request.body, {
    user_id: ctx.state.user.id
  })

  const draft = await ctx.api.post.createPostDraft(originalId, postObject)

  ctx.body = draft.json()
}

export async function updateDraft(ctx) {
  const { id } = ctx.params
  const draft = await ctx.api.post.updatePostDraft(id, ctx.request.body)
  ctx.body = draft.json()
}

export async function listDraft(ctx) {
  const options = _.pick(ctx.query, ['pageSize', 'page', 'order', 'filter', 'include'])
  ctx.body = await ctx.api.post.listDrafts(options)
}

export async function getPostDraft(ctx) {
  const { id } = ctx.params
  const options = _.pick(ctx.query, ['pageSize', 'page', 'order', 'filter', 'include'])
  ctx.body = await ctx.api.post.listPostDrafts(id, options)
}
