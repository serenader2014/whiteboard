export default function(api) {
  api.hooks.post({
    postRead: function(postObject) {
      const pageViewKey = `post_pageview_${postObject.id}`
      api.database.redis.read(pageViewKey).then(pageview => {
        if (!pageview) {
          pageview = 0
        }

        api.database.redis.save(pageViewKey, pageview + 1)
      })
    }
  })
}
