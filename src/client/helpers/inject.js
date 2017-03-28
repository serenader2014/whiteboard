import hbs from 'express-hbs'
import plugins from '../../service/plugins'

const injectsList = plugins.getInjectsList()

hbs.registerAsyncHelper('inject_head', async function(option, done) {
  let content = ''
  for (const i of injectsList.head) {
    content = content + await i.fn()
  }
  done(content)
})

hbs.registerAsyncHelper('inject_body', async function(option, done) {
  let content = ''
  for (const i of injectsList.body) {
    content = content + await i.fn()
  }
  done(content)
})

hbs.registerAsyncHelper('inject_foot', async function(option, done) {
  let content = ''
  for (const i of injectsList.foot) {
    content = content + await i.fn()
  }
  done(content)
})
