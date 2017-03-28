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
  }
}
