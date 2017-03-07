import { Setting, Settings } from '../model'
import { canThis } from '../service/permission'
import { OperationNotPermitted } from '../exceptions'

export async function update(requester, id, option) {
  const targetSetting = await Setting.query({ id })
  const isOperationPermitted = await canThis(requester, 'update', 'setting', targetSetting)
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to update setting`)
  return await Setting.update(targetSetting, option)
}

export async function list(requester, options) {
  const isOperationPermitted = await canThis(requester, 'read', 'setting')
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to read setting`)
  return await Settings.query({})
}
