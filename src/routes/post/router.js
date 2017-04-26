import { requireAuthenticated } from '../../middleware'
import {
  listPost,
  createPost,
  getPost,
  updatePost,
  listDraft,
  createDraft,
  updateDraft,
  getPostDraft
} from './controller'

export const baseUrl = '/api/v1/posts'

export default {
  '/': [{
    method: 'GET',
    handlers: [listPost]
  }, {
    method: 'POST',
    handlers: [requireAuthenticated(), createPost]
  }],
  '/drafts': [{
    method: 'GET',
    handlers: [requireAuthenticated(), listDraft]
  }],
  '/:id': [{
    method: 'GET',
    handlers: [getPost]
  }, {
    method: 'PUT',
    handlers: [requireAuthenticated(), updatePost]
  }],
  '/:id/drafts': [{
    method: 'GET',
    handlers: [requireAuthenticated(), getPostDraft]
  }, {
    method: 'POST',
    handlers: [requireAuthenticated(), createDraft]
  }, {
    method: 'PUT',
    handlers: [requireAuthenticated(), updateDraft]
  }]
}
