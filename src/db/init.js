import createTable from './create-table'
import schemas from './schemas'
import { Setting } from '../model'
import defaultSettings from '../../data/default-settings'

export default async function() {
  for (let model of Object.keys(schemas)) {
    try {
      await createTable(model, schemas[model])
    } catch (e) {
      console.log(e)
    }
  }

  const settings = await Setting.query({})
  if (!settings) {
    for (let setting of defaultSettings) {
      setting.created_at = new Date()
      setting.created_by = 0
      await Setting.create(setting)
    }
  }
}
