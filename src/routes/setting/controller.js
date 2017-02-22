import { Setting } from '../../model'
import { canThis } from '../../service/permission'
import { OperationNotPermitted } from '../../exceptions'

export async function listSetting(ctx) {
  const settings = await Setting.query({})
  ctx.body = settings.toJSON()
}

export async function updateSetting(ctx) {
  const { id } = ctx.params
  const targetSetting = await Setting.query({ id })
  const requester = ctx.state.user || 'guest'
  const isOperationPermitted = await canThis(requester, 'update', targetSetting)
  if (!isOperationPermitted) throw new OperationNotPermitted()
  const newSetting = await Setting.update(id, ctx.request.body)
  ctx.body = newSetting.structure(ctx.state.user)
}
