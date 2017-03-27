import _ from 'lodash'

export async function getPost(ctx) {
  const { id } = ctx.params
  const post = await ctx.api.post.get(id)

  ctx.body = post.json()
}

export async function listPost(ctx) {
  const posts = await ctx.api.post.listPublishedPost()

  ctx.body = posts.toJSON()
}

export async function updatePost(ctx) {
  const { id } = ctx.params
  const post = await ctx.api.post.update(id, ctx.request.body)

  ctx.body = post.json(true)
}

export async function createPost(ctx) {
  const postObject = _.extend({}, ctx.request.body, {
    user_id: ctx.state.user.id
  })
  const post = await ctx.api.post.create(postObject)

  ctx.body = post.json(true)
}

export async function createDraft() {

}

export async function updateDraft() {

}

export async function listDraft(ctx) {
  ctx.body = await ctx.api.post.listDraft()
}
