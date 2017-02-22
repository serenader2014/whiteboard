import { requireAuthenticated } from '../../middleware'
import { updateSetting, listSetting } from './controller'

export const baseUrl = '/api/v1/settings'

export default {
  '/': [{
    method: 'GET',
    handlers: [listSetting]
  }],
  '/:id': [{
    method: 'PUT',
    handlers: [requireAuthenticated(), updateSetting]
  }]
}
