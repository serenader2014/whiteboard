import Markdown from 'markdown-it'

const md = new Markdown()

export const config = {
  hooks: {
    post: {
      preSave: function(postObject) {
        postObject.html = md.render(postObject.content)
        return postObject
      }
    }
  },
  routes: {
    '/settings': {
      'get': function(ctx) {
        ctx.body = {
          message: 'hello world'
        }
      }
    }
  },
  inject: {
    body: function() {
      return '<div>this is injected by markdown plugin</div>'
    }
  },
  helpers: {
    'markdown_helper': function() {

    }
  }
}
