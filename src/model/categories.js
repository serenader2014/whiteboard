import bookshelf from '../db/bookshelf'
import CategoryField from '../service/validator/category-field'

export class Category extends bookshelf.Model {
  get tableName() {
    return 'categories'
  }

  static get availableFields() {
    return [
      'name'
    ]
  }

  static get defaultFields() {
    return {
      created_by: 0,
      created_at: new Date()
    }
  }

  async onSaving(model, attrs, options) {
    const { name } = model.attributes

    await new CategoryField({ name }).execute()
  }
}

export class Categories extends bookshelf.Collection {
  get model() {
    return Category
  }
}
