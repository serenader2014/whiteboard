import {
  createUser,
  getUserInfo,
  getSelfInfo,
  updateUserInfo,
  deleteUser,
  updateUserStatus,
  updateUserRoles,
  changePassword,
  getUserRoles
} from './controller'
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
  }, {
    method: 'DELETE',
    handlers: [requireAuthenticated(), deleteUser]
  }],
  '/:id/status': [{
    method: 'PUT',
    handlers: [requireAuthenticated(), updateUserStatus]
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
