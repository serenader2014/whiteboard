import bookshelf from '../db/bookshelf'
import SettingField from '../service/validator/setting-field'

export class Setting extends bookshelf.Model {
  get tableName() {
    return 'settings'
  }

  static get availableFields() {
    return [
      'type',
      'key',
      'value'
    ]
  }

  static get defaultFields() {
    return {
      created_by: 0,
      created_at: new Date()
    }
  }

  async onSaving(model, attrs, options) {
    const { type, value, key } = model.attributes
    await new SettingField({ type, value, key }).execute()
  }
}

export class Settings extends bookshelf.Collection {
  get model() {
    return Setting
  }
}
