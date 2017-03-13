import bookshelf from '../db/bookshelf'

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
}

export class Categories extends bookshelf.Collection {
  get model() {
    return Category
  }
}
