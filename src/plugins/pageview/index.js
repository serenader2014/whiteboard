export default function(api) {
  api.helpers.register('pageview', (options, locals) => {
    return api.database.redis.get().then(raw => {
      let pageviewMaps
      if (!raw) {
        pageviewMaps = {}
      } else {
        try {
          pageviewMaps = JSON.parse(raw)
        } catch (e) {
          api.database.redis.set('{}')
          return 0
        }
      }
      const targetPost = locals.post && locals.post.id
      if (!targetPost) {
        return 0
      }
      const pageview = pageviewMaps[targetPost]
      pageviewMaps[targetPost] = (pageview || 0) + 1

      api.database.redis.set(JSON.stringify(pageviewMaps))

      return pageview || 0
    })
  })
}
