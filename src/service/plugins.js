import path from 'path'
import _ from 'lodash'
import redis from 'redis'

import { Setting } from '../model'
import { DBError } from '../exceptions'

Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

const redisClient = redis.createClient({ url: process.env.REDIS_URL })

const modelList = ['post', 'category', 'role', 'setting', 'user']
const actionList = [
  'preCreate',
  'postCreate',
  'preUpdate',
  'postUpdate',
  'preSave',
  'postSave',
  'preDelete',
  'postDelete',
  'preRead',
  'postRead'
]

async function listPlugins(forceUpdate = false) {
  if (global.avaliablePlugins && !forceUpdate) return global.avaliablePlugins

  const fileList = await fs.readdirAsync(path.resolve(__dirname, '..', 'plugins'))
  const folderList = {}
  for (const i of fileList) {
    const dir = path.resolve(__dirname, '..', 'plugins', i)
    const stat = await fs.statAsync(dir)
    if (stat.isDirectory()) {
      try {
        const pkg = require(`${dir}/package.json`)
        folderList[pkg.name] = {
          pkg: pkg,
          dir
        }
      } catch (e) {
        console.log(`package.json is missiong, skip for this folder: ${i}`)
      }
    }
  }

  // cache plugin list
  global.avaliablePlugins = folderList

  return folderList
}

export async function setUpPlugins() {
  const pluginSetting = await Setting.query({ key: 'enabled_plugins', type: 'core' })

  if (!pluginSetting) {
    return
  }

  try {
    const enabledPlugins = JSON.parse(pluginSetting.get('value'))
    const avaliablePlugins = await listPlugins()

    for (const i of enabledPlugins) {
      const plugin = avaliablePlugins[i]
      if (plugin) {
        try {
          plugins.set(plugin)
        } catch (e) {
          console.log(e)
          // enabled, but not installed
          console.log(`Setting plugin ${i} failed, will skip it`)
        }
      } else {
        console.log(`Can not find enabled plugin: ${i}, will skip it`)
      }
    }
  } catch (e) {
    throw new DBError(`unable to parse plugin setting: ${e.message}`)
  }
}

const plugins = (() => {
  const list = []
  const hooksList = {}
  const routesList = []
  const injectsList = {
    body: [],
    head: [],
    foot: []
  }
  const helpersList = []

  for (const model of modelList) {
    hooksList[model] = {}
    for (const action of actionList) {
      hooksList[model][action] = []
    }
  }

  return {
    get() {
      return list
    },
    getHooksList() {
      return hooksList
    },
    getRoutesList() {
      return routesList
    },
    getInjectsList() {
      return injectsList
    },
    getHelpersList() {
      return helpersList
    },
    set(plugin) {
      list.push(plugin)
      const pluginApi = {
        hooks: {},
        injects: {
          register(object) {
            const allowedLocation = ['body', 'head', 'foot']
            const list = _.pick(object, allowedLocation)
            for (const i of Object.keys(list)) {
              injectsList[i].push({
                fn: list[i],
                plugin: plugin
              })
            }
          }
        },
        routes: {
          register(object) {
            for (const route in object) {
              routesList.push({
                path: route,
                handlers: object[route],
                plugin: plugin
              })
            }
          }
        },
        helpers: {
          register(name, fn) {
            helpersList.push({
              helper: {
                name: name,
                fn: fn
              },
              plugin: plugin
            })
          }
        },
        model: {},
        database: {
          get() {
            const key = `plugin_data_${plugin.pkg.name}`
            return redisClient.getAsync(key)
          },
          set(value) {
            const key = `plugin_data_${plugin.pkg.name}`
            return redisClient.setAsync(key, value)
          }
        }
      }

      const api = require('../api')

      for (const model of Object.keys(api)) {
        pluginApi.model[model] = {}
        for (const method of Object.keys(api[model])) {
          const fn = api[model][method]
          const requester = {
            async permissions() {
              const { Permission } = require('../model')
              const pluginPermissions = []

              for (const object of Object.keys(plugin.pkg.permissions)) {
                const actions = plugin.pkg.permissions[object]
                for (const action of actions) {
                  const permission = await Permission.query({object_type: object, action_type: action})
                  if (permission) {
                    pluginPermissions.push(permission.toJSON())
                  }
                }
              }
              return pluginPermissions
            }
          }
          pluginApi.model[model][method] = (...args) => {
            return fn.apply(api[model], [requester, ...args])
          }
        }
      }

      for (const model of modelList) {
        pluginApi.hooks[model] = function(object) {
          const list = _.pick(object, actionList)
          for (const i of Object.keys(list)) {
            hooksList[model][i].push(list[i])
          }
        }
      }
      require(plugin.dir).default(pluginApi)
    },
    async triggerHook(scope, action, model) {
      const p = hooksList[scope][action]
      let attributes = Object.assign({}, model.attributes)
      for (const fn of p) {
        attributes = await fn(attributes)
      }
      for (const i of Object.keys(attributes)) {
        model.set(i, attributes[i])
      }
      return model
    }
  }
})()

export default plugins
