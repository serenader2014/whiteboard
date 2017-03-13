import { requireAuthenticated } from '../../middleware'
import { listCategories, getCategory, updateCategory, deleteCategory } from './controller'

export const baseUrl = '/api/v1/categories'

export default {
  '/': [{
    method: 'GET',
    handlers: [listCategories]
  }],
  '/:id': [{
    method: 'GET',
    handlers: [getCategory]
  }, {
    method: 'PUT',
    handlers: [requireAuthenticated(), updateCategory]
  }, {
    method: 'DELETE',
    handlers: [requireAuthenticated(), deleteCategory]
  }]
}
