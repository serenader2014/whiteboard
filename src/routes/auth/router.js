import { login, logout } from './controller'
import { requireUnauthenticated, requireAuthenticated } from '../../middleware'
export const baseUrl = '/api/v1'

export default {
  '/login': [{
    method: 'POST',
    handlers: [requireUnauthenticated(), login]
  }],
  '/logout': [{
    method: 'GET',
    handlers: [requireAuthenticated(), logout]
  }]
}
