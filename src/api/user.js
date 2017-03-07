import _ from 'lodash'

import { User, Users, Roles } from '../model'
import { OperationNotPermitted, BadPassword } from '../exceptions'
import { canThis } from '../service/permission'

export async function create(requester, object) {
  const isOperationPermitted = await canThis(requester, 'create', 'user')
  if (!isOperationPermitted) throw new OperationNotPermitted('You dont have permission to create user')
  const allowedFields = [
    'username',
    'email',
    'password',
    'cover',
    'bio',
    'website',
    'location',
    'language',
    'tour',
    'status'
  ]

  return User.create(_.pick(object, allowedFields), requester)
}

export async function updateInfo(requester, id, object) {
  const targetResource = await User.getActiveUser({ id })
  const isOperationPermitted = await canThis(requester, 'update', 'user', targetResource)
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to update user(${id}) info`)
  const allowedFields = [
    'username',
    'email',
    'image',
    'cover',
    'bio',
    'website',
    'location',
    'language',
    'tour'
  ]

  return User.update(targetResource, _.pick(object, allowedFields), requester)
}

export async function updateStatus(requester, id, status) {
  const targetResource = await User.query({ id })
  const isOperationPermitted = await canThis(requester, 'update', 'user.status', targetResource)
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to update user status`)

  return User.update(targetResource, { status }, requester)
}

export async function changeRole(requester, id, roles) {
  const targetResource = await User.getActiveUser({ id })
  const isOperationPermitted = await canThis(requester, 'update', 'user.roles', targetResource)
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to update user roles`)

  let targetRoles = await Roles.query(qb => qb.whereIn('id', roles))
  const currentRoles = await targetResource.roles().fetch()

  const addedRoles = targetRoles.filter(item => !currentRoles.get(item.get('id')))
  const deletedRoles = currentRoles.filter(item => !targetRoles.get(item.get('id')))

  if (addedRoles.length) {
    await targetResource.roles().attach(addedRoles.map(item => item.get('id')))
  }

  if (deletedRoles.length) {
    await targetResource.roles().detach(deletedRoles.map(item => item.get('id')))
  }

  return targetResource
}

export async function del(requester, id) {
  const targetResource = await User.getActiveUser({ id })
  const isOperationPermitted = await canThis(requester, 'delete', 'user', targetResource)
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to delete user`)

  return User.update(targetResource, { status: 'deleted' }, requester)
}

export async function getInfo(requester, id) {
  const targetResource = await User.getActiveUser({ id })
  const isOperationPermitted = await canThis(requester, 'read', 'user', targetResource)

  return targetResource.json(isOperationPermitted)
}

export async function getRoles(requester, id) {
  const targetResource = await User.getActiveUser({ id })
  const isOperationPermitted = await canThis(requester, 'read', 'user.roles', targetResource)
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to read user roles`)

  return targetResource.roles().fetch()
}

export async function changePassword(requester, id, oldPassword, newPassword) {
  const targetResource = await User.getActiveUser({ id })
  const isOperationPermitted = await canThis(requester, 'update', 'user', targetResource)
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to change user password`)

  const isPasswordCorrect = await targetResource.validatePassword(oldPassword)
  if (!isPasswordCorrect) throw new BadPassword(`Old password is not correct`)

  return targetResource.save({ password: newPassword })
}

export async function list() {
  const users = await Users.query()

  return users.toJSON()
}
