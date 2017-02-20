import { createUser } from './controller'

export const baseUrl = '/users'

export default {
  '/': [{
    method: 'POST',
    handlers: [createUser]
  }]
}
