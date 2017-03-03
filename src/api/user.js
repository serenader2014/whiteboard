import _ from 'lodash'

import { User, Users, Roles } from '../model'
import { OperationNotPermitted, RecordNotFound } from '../exceptions'
import { canThis } from '../service/permission'

export async function createUser(requester, object) {
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

export async function updateUserInfo(requester, id, object) {
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

export async function updateUserStatus(requester, id, status) {
  const targetResource = await User.getActiveUser({ id })
  const isOperationPermitted = await canThis(requester, 'update', 'user.status', targetResource)
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to update user status`)

  return User.update(targetResource, { status }, requester)
}

export async function changeUserRole(requester, id, roles) {
  const targetResource = await User.getActiveUser({ id })
  const isOperationPermitted = await canThis(requester, 'update', 'user.roles', targetResource)
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to update user roles`)

  const targetRoles = await Roles.query(qb => qb.whereIn('id', roles))

  await targetResource.roles().attach(targetRoles.models)
  return targetResource
}

export async function deleteUser(requester, id) {
  const targetResource = await User.getActiveUser({ id })
  const isOperationPermitted = await canThis(requester, 'delete', 'user', targetResource)
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to delete user`)

  return User.update(targetResource, { status: 'deleted' }, requester)
}

export async function getUserInfo(requester, id) {
  const targetResource = await User.getActiveUser({ id })
  const isOperationPermitted = await canThis(requester, 'read', 'user', targetResource)

  return targetResource.json(isOperationPermitted)
}

export async function getUserRoles(requester, id) {
  const targetResource = await User.getActiveUser({ id })
  const isOperationPermitted = await canThis(requester, 'read', 'user.roles', targetResource)
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to read user roles`)

  return targetResource.roles().fetch()
}

export async function listUser() {
  const users = await Users.query()

  return users.toJSON()
}
