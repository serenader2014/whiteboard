import _ from 'lodash'

export async function getPost() {

}

export async function listPost() {

}

export async function updatePost() {

}

export async function createPost(ctx) {
  const postObject = _.extend({}, ctx.request.body, {
    user_id: ctx.state.user.id
  })
  const post = await ctx.api.post.create(postObject)

  ctx.body = post.json(true)
}
