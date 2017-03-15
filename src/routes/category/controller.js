export async function listCategories(ctx) {
  const categories = await ctx.api.category.list()

  ctx.body = categories
}

export async function getCategory(ctx) {
  const { id } = ctx.params
  const category = await ctx.api.category.get(id)

  ctx.body = category.json(true)
}

export async function updateCategory(ctx) {

}

export async function deleteCategory(ctx) {

}

export async function createCategory(ctx) {
  const { body } = ctx.request
  const category = await ctx.api.category.create(body)
  ctx.body = category.json(true)
}
