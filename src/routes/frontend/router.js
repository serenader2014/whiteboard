import { homePage } from './controller'

export const baseUrl = '/'

export default {
  '/': [{
    method: 'GET',
    handlers: [homePage]
  }]
}
