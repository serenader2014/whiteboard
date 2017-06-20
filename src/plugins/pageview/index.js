import isBot from 'isbot'

export default function(api) {
  api.helpers.register('pageview', (options, locals) => {
    return api.database.get().then(raw => {
      let pageviewMaps
      if (!raw) {
        pageviewMaps = {}
      } else {
        try {
          pageviewMaps = JSON.parse(raw)
        } catch (e) {
          api.database.set('{}')
          return 0
        }
      }
      const targetPost = locals.post && locals.post.id
      if (!targetPost) {
        return 0
      }
      const pageview = pageviewMaps[targetPost]

      if (locals.router.headers && locals.router.headers['user-agent'] && !isBot(locals.router.headers['user-agent'])) {
        pageviewMaps[targetPost] = (pageview || 0) + 1
        api.database.set(JSON.stringify(pageviewMaps))
      }

      return pageview || 0
    })
  })
}
