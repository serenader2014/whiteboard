import { requireAuthenticated } from '../../middleware'
import { listPost, createPost, getPost, updatePost, createDraft, updateDraft } from './controller'

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
  }],
  '/:id/draft': [{
    method: 'POST',
    handlers: [requireAuthenticated(), createDraft]
  }, {
    method: 'PUT',
    handlers: [requireAuthenticated(), updateDraft]
  }]
}
