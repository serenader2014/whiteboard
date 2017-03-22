import _ from 'lodash'
import htmlToText from 'html-to-text'

import { Post } from '../model'
import { canThis } from '../service/permission'
import { OperationNotPermitted } from '../exceptions'

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
  const excerpt = htmlToText.fromString(postObject.html)
  postObject.excerpt = excerpt.length > 250 ? `${excerpt} ...` : excerpt

  if (postObject.status === 'published') {
    postObject.publish_by = postObject.user_id
    postObject.publish_at = new Date()
  }

  return Post.create(postObject, requester)
}
