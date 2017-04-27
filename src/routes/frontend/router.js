import { mainChannel, postDetail } from './controller'

export const baseUrl = ''

export default {
  '/': [{
    method: 'GET',
    handlers: [mainChannel]
  }],
  '/page/:page': [{
    method: 'GET',
    handlers: [mainChannel]
  }],
  '/post/:slug': [{
    method: 'GET',
    handlers: [postDetail]
  }]
}
