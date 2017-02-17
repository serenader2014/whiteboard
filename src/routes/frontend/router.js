import { sayHi } from './controller'

export const baseUrl = '/'

export default {
  '/': [{
    method: 'GET',
    handlers: [sayHi]
  }]
}
