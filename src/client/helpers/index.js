import hbs from 'express-hbs'

import plugins from '../../service/plugins'

export function setUpPluginHelpers() {
  const helpersList = plugins.getHelpersList()

  for (const helper of helpersList) {
    hbs.registerAsyncHelper(helper.helper.name, (option, cb) => {
      Promise.resolve(helper.helper.fn(option)).then((str) => {
        cb(str)
      })
    })
  }
}

export function setUpHelpers() {
  require('./inject')
  setUpPluginHelpers()
}
