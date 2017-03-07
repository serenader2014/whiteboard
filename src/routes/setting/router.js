import { requireAuthenticated } from '../../middleware'
import { updateSetting, listSettings, getSetting } from './controller'

export const baseUrl = '/api/v1/settings'

export default {
  '/': [{
    method: 'GET',
    handlers: [requireAuthenticated(), listSettings]
  }],
  '/:id': [{
    method: 'GET',
    handlers: [requireAuthenticated(), getSetting]
  }, {
    method: 'PUT',
    handlers: [requireAuthenticated(), updateSetting]
  }]
}
