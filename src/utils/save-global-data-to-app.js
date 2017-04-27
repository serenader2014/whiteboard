import { setting } from '../api'

export default async function saveGlobalDataToApp(app) {
  const settings = await setting.listAll({ context: 'internal' })
  const blogSettings = {}
  const coreSettings = {}
  settings.toJSON().forEach((item) => {
    if (item.type === 'blog') {
      blogSettings[item.key] = item.value
    } else if (item.type === 'core') {
      coreSettings[item.key] = item.value
    }
  })
  let channel

  if (coreSettings.home_page_channel === 'all') {
    channel = 'all'
  } else {
    try {
      channel = JSON.parse(coreSettings.home_page_channel)
    } catch (e) {
      channel = 'all'
    }
  }
  coreSettings.home_page_channel = channel

  app.context.locals = {
    blogSettings,
    coreSettings
  }
}
