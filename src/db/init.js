import createTable from './create-table'
import schemas from './schemas'
import { Setting, Role, Permission } from '../model'
import { DBError } from '../exceptions'

import defaultSettings from '../../data/default-settings'
import defaultRoles from '../../data/default-roles'
import defaultPermissions from '../../data/default-permissions'
import permissionControl from '../../data/default-role-permission'

export default async function() {
  for (let model of Object.keys(schemas)) {
    try {
      await createTable(model, schemas[model])
    } catch (e) {
      console.log(e)
    }
  }

  const permissions = await Permission.query({})

  if (!permissions) {
    for (let permission of defaultPermissions) {
      await Permission.create(permission)
    }
  }

  const roles = await Role.query({})
  if (!roles) {
    for (let role of defaultRoles) {
      const newRole = await Role.create(role)
      const grantedPermissions = permissionControl[newRole.get('name')]
      for (let i of Object.keys(grantedPermissions)) {
        const permissionList = grantedPermissions[i]
        for (let action of permissionList) {
          const targetPermission = await Permission.query({ object_type: i, action_type: action })
          if (!targetPermission) {
            throw new DBError(`Target permission not found: object_type: ${i}, action_type: ${action}`)
          }
          newRole.permissions().attach(targetPermission)
        }
      }
    }
  }

  const settings = await Setting.query({})
  if (!settings) {
    for (let setting of defaultSettings) {
      await Setting.create(setting)
    }
  }
}
