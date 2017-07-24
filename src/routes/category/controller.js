import _ from 'lodash'

export async function listCategories(ctx) {
  const options = _.pick(ctx.query, ['pageSize', 'page', 'order', 'filter'])
  options.include = 'count'
  const categories = await ctx.api.category.list(options)

  ctx.body = categories
}

export async function getCategory(ctx) {
  const { id } = ctx.params
  const category = await ctx.api.category.get(id)

  ctx.body = category.json()
}

export async function updateCategory(ctx) {
  const { name } = ctx.request.body
  const { id } = ctx.params
  const category = await ctx.api.category.update(id, { name })

  ctx.body = category.json()
}

export async function deleteCategory(ctx) {
  const { id } = ctx.params

  await ctx.api.category.del(id)

  ctx.body = { message: 'ok' }
}

export async function createCategory(ctx) {
  const { body } = ctx.request
  const category = await ctx.api.category.create(body)
  ctx.body = category.json()
}
