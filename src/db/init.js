import knex from './connection'
import createTable from './create-table'
import schemas from './schemas'
import { Setting, Settings, Role, Roles, Permission } from '../model'

import defaultSettings from '../../data/default-settings'
import defaultRoles from '../../data/default-roles'
import permissionControl from '../../data/default-role-permission'

export default async function() {
  for (let model of Object.keys(schemas)) {
    const isTableExist = await knex.schema.hasTable(model)
    if (!isTableExist) {
      await createTable(model, schemas[model])
    }
  }

  const roles = await Roles.query()
  if (!roles.length) {
    for (let role of defaultRoles) {
      const newRole = await Role.create(role)
      const grantedPermissions = permissionControl[newRole.get('name')]

      for (let i of Object.keys(grantedPermissions)) {
        const permissionList = grantedPermissions[i]

        for (let action of permissionList) {
          const permissionObject = { object_type: i }
          if (typeof action === 'string') {
            permissionObject.action_type = action
          } else if (action.name) {
            permissionObject.action_type = action.name
            permissionObject.condition = action.condition
          }
          let permission = await Permission.query(permissionObject)
          if (!permission) {
            permissionObject.name = `${permissionObject.action_type}_${permissionObject.object_type}`
            if (permissionObject.condition) {
              permissionObject.name = `${permissionObject.name}_when_${permissionObject.condition}`
            }
            permission = await Permission.create(permissionObject)
          }
          await newRole.permissions().attach(permission)
        }
      }
    }
  }

  const settings = await Settings.query()
  if (!settings.length) {
    for (let setting of defaultSettings) {
      await Setting.create(setting)
    }
  }
}
