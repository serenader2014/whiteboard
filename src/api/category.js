import _ from 'lodash'

import { Category } from '../model'
import { canThis } from '../service/permission'
import { OperationNotPermitted } from '../exceptions'

export async function create(requester, object) {
  const isOperationPermitted = await canThis(requester, 'create', 'category')
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to create category`)
  const allowedField = ['name']

  return Category.create(_.pick(object, allowedField), requester)
}
