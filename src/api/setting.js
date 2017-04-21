import { Setting, Settings } from '../model'
import { canThis } from '../service/permission'
import { OperationNotPermitted, RecordNotFound } from '../exceptions'

export async function update(requester, id, option) {
  const targetSetting = await Setting.query({ id })
  if (!targetSetting) throw new RecordNotFound(`Can not find target setting`)
  const isOperationPermitted = await canThis(requester, 'update', 'setting', targetSetting)
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to update setting`)
  return await Setting.update(targetSetting, option)
}

export async function listAll(requester, options) {
  const isOperationPermitted = await canThis(requester, 'read', 'setting')
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to read setting`)
  return await Settings.query(options)
}

export async function get(requester, id) {
  const isOperationPermitted = await canThis(requester, 'read', 'setting')
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to read setting`)
  const targetSetting = await Setting.query({ id })
  if (!targetSetting) throw new RecordNotFound(`Can not find target setting`)
  return targetSetting
}
