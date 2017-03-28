import path from 'path'
import _ from 'lodash'

import { Setting } from '../model'
import { DBError } from '../exceptions'

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
          require(plugin.dir)
          plugins.set(plugin)
        } catch (e) {
          // enabled, but not installed
          console.log(`Plugin ${i} is not initialized, will skip it`)
        }
      } else {
        console.log(`Can not find enabled plugin: ${i}, will skip it`)
      }
    }
  } catch (e) {
    throw new DBError(`unable to parse plugin setting: ${e.message}`)
  }
}

export const plugins = (() => {
  const list = []

  return {
    get() {
      return list
    },
    set(plugin) {
      list.push(plugin)
    },
    // post preSave
    getPluginsByPermission(scope, action) {
      return list.filter(plugin => {
        return plugin.pkg.permissions[scope] && _.includes(plugin.pkg.permissions[scope], action)
      })
    },
    async triggerHook(scope, action, model) {
      const p = this.getPluginsByPermission(scope, action)
      for (const pluginObj of p) {
        const plugin = require(pluginObj.dir)
        if (plugin.config && plugin.config.hooks && plugin.config.hooks[scope] && plugin.config.hooks[scope][action]) {
          const newAttribute = await plugin.config.hooks[scope][action](Object.assign({}, model.attributes))
          for (const i of Object.keys(newAttribute)) {
            model.set(i, newAttribute[i])
          }
        }
      }
      return model
    }
  }
})()
