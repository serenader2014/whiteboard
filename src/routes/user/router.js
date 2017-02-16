import { createUser } from './controller'

export const baseUrl = '/user'

export default {
  '/': [{
    method: 'POST',
    handlers: [createUser]
  }]
}
