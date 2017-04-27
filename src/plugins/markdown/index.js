import Markdown from 'markdown-it'
import path from 'path'

const md = new Markdown()

export default function markdown(api) {
  api.hooks.post({
    preSave: function(postObject) {
      postObject.html = md.render(postObject.content)
      return postObject
    }
  })

  api.routes.register({
    '/settings': {
      'get': async function(ctx) {
        const posts = await api.model.post.listPublishedPosts()
        await ctx.render(path.resolve(__dirname, 'view.hbs'), {
          posts: posts.data
        })
      }
    }
  })

  api.injects.register({
    body: function() {
      return '<div>this is injected by markdown plugin</div>'
    }
  })

  api.helpers.register('markdown_helper', function(str, locals) {
    return md.render(str)
  })
}

