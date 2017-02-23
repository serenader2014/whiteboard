import bookshelf from '../db/bookshelf'

export class Setting extends bookshelf.Model {
  get tableName() {
    return 'settings'
  }

  get resourceName() {
    return 'setting'
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
}

export class Settings extends bookshelf.Collection {
  get model() {
    return Setting
  }
}
