import { requireAuthenticated } from '../../middleware'
import { listPost, createPost, getPost, updatePost } from './controller'

export const baseUrl = '/api/v1/posts'

export default {
  '/': [{
    method: 'GET',
    handlers: [listPost]
  }, {
    method: 'POST',
    handlers: [requireAuthenticated(), createPost]
  }],
  '/:id': [{
    method: 'GET',
    handlers: [getPost]
  }, {
    method: 'PUT',
    handlers: [requireAuthenticated(), updatePost]
  }]
}
