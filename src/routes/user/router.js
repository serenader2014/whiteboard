import { createUser, getUserInfo, getSelfInfo } from './controller'
import { requireUnauthenticated, requireAuthenticated } from '../../middleware'

export const baseUrl = '/api/v1/users'

export default {
  '/': [{
    method: 'POST',
    handlers: [requireUnauthenticated(), createUser]
  }],
  '/self': [{
    method: 'GET',
    handlers: [requireAuthenticated(), getSelfInfo]
  }],
  '/:id': [{
    method: 'GET',
    handlers: [getUserInfo]
  }]
}
