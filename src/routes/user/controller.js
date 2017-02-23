import { User } from '../../model'
import { RecordNotFound, OperationNotPermitted } from '../../exceptions'
import { canThis } from '../../service/permission'

export async function createUser(ctx, next) {
  const { email, password } = ctx.request.body
  const newUser = await User.create({ email, password })
  ctx.body = newUser.json(true)
}

export async function getUserInfo(ctx) {
  const targetUser = await User.query({ id: ctx.params.id })
  if (!targetUser) throw new RecordNotFound(`Can not find requested user: user ID: ${ctx.params.id}`)
  const requester = ctx.state.user || 'guest'
  const isOperationPermitted = await canThis(requester, 'read', targetUser)
  ctx.body = targetUser.json(isOperationPermitted)
}

export function getSelfInfo(ctx) {
  ctx.body = ctx.state.user.json(true)
}

export async function updateUserInfo(ctx) {
  const requester = ctx.state.user || 'guest'
  const { id } = ctx.params
  const targetResource = await User.query({ id })
  if (!targetResource) throw new RecordNotFound(`Can not find target user: user ID: ${id}`)

  const isOperationPermitted = await canThis(requester, 'update', targetResource)

  if (!isOperationPermitted) throw new OperationNotPermitted('You dont have permission to operate this task')

  const user = await User.update(id, ctx.request.body)
  ctx.body = user.json(await canThis(requester, 'read', user))
}
