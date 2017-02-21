import { createUser, getUserInfo } from './controller'

export const baseUrl = '/api/v1/users'

export default {
  '/': [{
    method: 'POST',
    handlers: [createUser]
  }],
  '/:id': [{
    method: 'GET',
    handlers: [getUserInfo]
  }]
}
