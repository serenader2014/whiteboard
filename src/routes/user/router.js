import {
  createUser,
  getUserInfo,
  getSelfInfo,
  updateUserInfo,
  deleteUser,
  deactivateUser,
  activateUser,
  updateUserRoles,
  changePassword,
  getUserRoles,
  listUsers,
  getUserInfoByEmail,
  getUserInfoBySlug
} from './controller'
import { requireAuthenticated } from '../../middleware'

export const baseUrl = '/api/v1/users'

export default {
  '/': [{
    method: 'GET',
    handlers: [listUsers]
  }, {
    method: 'POST',
    handlers: [requireAuthenticated(), createUser]
  }],
  '/self': [{
    method: 'GET',
    handlers: [requireAuthenticated(), getSelfInfo]
  }],
  '/email/:email': [{
    method: 'GET',
    handlers: [getUserInfoByEmail]
  }],
  '/slug/:slug': [{
    method: 'GET',
    handlers: [getUserInfoBySlug]
  }],
  '/:id': [{
    method: 'GET',
    handlers: [getUserInfo]
  }, {
    method: 'PUT',
    handlers: [requireAuthenticated(), updateUserInfo]
  }, {
    method: 'DELETE',
    handlers: [requireAuthenticated(), deleteUser]
  }],
  '/:id/deactivate': [{
    method: 'POST',
    handlers: [requireAuthenticated(), deactivateUser]
  }],
  '/:id/activate': [{
    method: 'POST',
    handlers: [requireAuthenticated(), activateUser]
  }],
  '/:id/roles': [{
    method: 'GET',
    handlers: [requireAuthenticated(), getUserRoles]
  }, {
    method: 'PUT',
    handlers: [requireAuthenticated(), updateUserRoles]
  }],
  '/:id/password': [{
    method: 'PUT',
    handlers: [requireAuthenticated(), changePassword]
  }]
}
