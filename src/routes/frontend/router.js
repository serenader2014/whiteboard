import { mainChannel, postDetail } from './controller'

export const baseUrl = ''

export default {
  '/': [{
    method: 'GET',
    handlers: [mainChannel],
    name: 'homePage'
  }],
  '/page/:page': [{
    method: 'GET',
    handlers: [mainChannel],
    name: 'pagedHomePage'
  }],
  '/post/:slug': [{
    method: 'GET',
    handlers: [postDetail],
    name: 'postDetail'
  }]
}
