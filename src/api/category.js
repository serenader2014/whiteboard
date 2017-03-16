import _ from 'lodash'

import { Category, Categories } from '../model'
import { canThis } from '../service/permission'
import { OperationNotPermitted, RecordNotFound } from '../exceptions'

export async function create(requester, object) {
  const isOperationPermitted = await canThis(requester, 'create', 'category')
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to create category`)
  const allowedField = ['name']

  return Category.create(_.pick(object, allowedField), requester)
}

export async function get(requester, id) {
  const isOperationPermitted = await canThis(requester, 'read', 'category')
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to read category`)

  const category = await Category.query({ id })
  if (!category) throw new RecordNotFound(`Can not find target category: ID: ${id}`)

  return category
}

export async function list(requester) {
  const isOperationPermitted = await canThis(requester, 'read', 'category')
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to read category`)
  return Categories.query({})
}

export async function update(requester, id, options) {
  const isOperationPermitted = await canThis(requester, 'update', 'category')
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to update category`)

  const category = await Category.query({ id })
  if (!category) throw new RecordNotFound(`Can not find target category: ID: ${id}`)

  return Category.update(category, options, requester)
}

export async function del(requester, id) {
  const isOperationPermitted = await canThis(requester, 'delete', 'category')
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to delete category`)

  const category = await Category.query({ id })
  if (!category) throw new RecordNotFound(`Can not find target category: ID: ${id}`)

  return category.destroy()
}
