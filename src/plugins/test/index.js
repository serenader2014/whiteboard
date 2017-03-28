export const config = {
  hooks: {
    post: {
      preSave: function(postObject) {
        postObject.html = postObject.html + '<br><p>content added by test plugin</p>'
        return postObject
      }
    }
  }
}
