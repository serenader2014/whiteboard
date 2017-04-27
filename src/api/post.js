import _ from 'lodash'
import gql from 'ghost-gql'

import { Post } from '../model'
import { canThis, generatePermissionQuery } from '../service/permission'
import { OperationNotPermitted, RecordNotFound } from '../exceptions'

function validateFilters(filters) {
  filters.statements = gql.json.rejectStatements(filters.statements, statement => {
    const allowedFields = ['id', 'title', 'cover', 'excerpt', 'content', 'html', 'featured', 'slug', 'user_id', 'category_id']
    return !_.includes(allowedFields, statement.prop)
  })
  return filters
}

function validateInclude(include) {
  const allowedData = ['user', 'category']
  return include.filter(item => _.includes(allowedData, item))
}

function validateOrder(order = '') {
  const key = order.replace(/^-/, '')
  const allowedFields = ['id', 'featured', 'created_at', 'created_by', 'updated_at', 'updated_by', 'publish_at', 'publish_by', 'user_id', 'category_id']
  if (_.includes(allowedFields, key)) {
    return order
  } else {
    return 'created_at'
  }
}

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

export async function get(requester, id, include = []) {
  const related = include.filter(item => ['user', 'category'].indexOf(item) !== -1)
  const targetResource = await Post.query({ id }, { withRelated: related })
  if (!targetResource) {
    throw new RecordNotFound('Can not find target resource')
  }

  const permissionType = targetResource.get('status') === 'published' ? 'post' : 'draft'
  const isOperationPermitted = await canThis(requester, 'read', permissionType, targetResource)

  if (!isOperationPermitted) {
    throw new RecordNotFound('Can not find target resource')
  }

  return targetResource
}

export async function listPublishedPosts(requester, options, channel) {
  const posts = await Post.list(options, qb => {
    qb.where('status', '=', 'published')
    if (channel && channel !== 'all') {
      qb.whereIn('category_id', channel)
    }
  }, { validateFilters, validateInclude, validateOrder })
  return posts
}

export async function listDrafts(requester, options) {
  const query = await generatePermissionQuery(requester, 'read', 'draft')

  if (!query) {
    throw new OperationNotPermitted('You dont have permission to list draft')
  }

  const drafts = await Post.list(options, qb => {
    qb.where({
      status: 'draft',
      original_id: null
    })
    if (Array.isArray(query)) {
      qb.where.apply(qb, query)
    }
  }, { validateFilters, validateInclude, validateOrder })

  return drafts
}

export async function createPostDraft(requester, originalId, object) {
  const isOperationPermitted = await canThis(requester, 'create', 'post')
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to create post`)

  const allowedFields = [
    'title',
    'cover',
    'content',
    'featured',
    'category_id',
    'user_id'
  ]

  const postObject = _.pick(object, allowedFields)

  postObject.html = postObject.content
  postObject.status = 'draft'
  postObject.original_id = originalId

  return Post.create(postObject, requester)
}

export async function listPostDrafts(requester, id, options) {
  const query = await generatePermissionQuery(requester, 'read', 'draft')

  if (!query) {
    throw new OperationNotPermitted('You dont have permission to list draft')
  }

  const drafts = await Post.list(options, qb => {
    qb.where({
      original_id: id
    })
    if (Array.isArray(query)) {
      qb.where.apply(qb, query)
    }
  }, { validateFilters, validateInclude, validateOrder })

  return drafts
}

export async function updatePostDraft(requester, id, object) {
  const isOperationPermitted = await canThis(requester, 'update', 'draft')
  if (!isOperationPermitted) throw new OperationNotPermitted(`You dont have permission to update draft`)
  const targetResource = await Post.query({ original_id: id }, null, '-created_at')
  if (!targetResource) throw new RecordNotFound('Can not find target resource')

  const allowedFields = [
    'title',
    'cover',
    'content',
    'featured',
    'category_id'
  ]

  const postObject = _.pick(object, allowedFields)
  postObject.html = postObject.content

  return Post.update(targetResource, postObject, requester)
}

export async function deletePostDraft(requester, id) {
  const targetResource = await Post.query({ id })
  if (!targetResource) {
    throw new RecordNotFound('Can not find target resource')
  }
  const isOperationPermitted = await canThis(requester, 'delete', 'draft', targetResource)
  if (!isOperationPermitted) {
    throw new OperationNotPermitted('You dont have permission to delete draft')
  }

  return targetResource.destroy()
}
