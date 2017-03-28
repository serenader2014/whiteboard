export async function sayHi(ctx) {
  await ctx.render('index.hbs', {
    title: 'hello world'
  })
}
