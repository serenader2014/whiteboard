import { createUser, getUserInfo, getSelfInfo, updateUserInfo } from './controller'
import { requireAuthenticated } from '../../middleware'

export const baseUrl = '/api/v1/users'

export default {
  '/': [{
    method: 'POST',
    handlers: [requireAuthenticated(), createUser]
  }],
  '/self': [{
    method: 'GET',
    handlers: [requireAuthenticated(), getSelfInfo]
  }],
  '/:id': [{
    method: 'GET',
    handlers: [getUserInfo]
  }, {
    method: 'PUT',
    handlers: [requireAuthenticated(), updateUserInfo]
  }]
}
