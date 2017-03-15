export async function listCategories(ctx) {

}

export async function getCategory(ctx) {

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
