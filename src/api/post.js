import _ from 'lodash'

import { Post } from '../model'
import { canThis } from '../service/permission'
import { OperationNotPermitted, RecordNotFound } from '../exceptions'

export async function create(requester, object) {
  const isOperationPermitted = await canThis(requester, 'create', 'post')
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to create post`)

  const allowedFields = [
    'title',
    'cover',
    'content',
    'featured',
    'status',
    'category_id',
    'user_id'
  ]

  const postObject = _.pick(object, allowedFields)

  postObject.html = postObject.content

  if (postObject.status === 'published') {
    postObject.publish_by = postObject.user_id
  }

  return Post.create(postObject, requester)
}

export async function update(requester, id, object) {
  const isOperationPermitted = await canThis(requester, 'update', 'post')
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to update post`)
  const targetResource = await Post.query({ id })
  if (!targetResource) throw new RecordNotFound('Can not find target resource')

  const allowedFields = [
    'title',
    'cover',
    'content',
    'featured',
    'status',
    'category_id'
  ]

  const postObject = _.pick(object, allowedFields)
  postObject.html = postObject.content

  if (postObject.status === 'published') {
    postObject.publish_by = requester.id
  }

  return Post.update(targetResource, postObject, requester)
}
