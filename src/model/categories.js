import bookshelf from '../db/bookshelf'
import CategoryField from '../service/validator/category-field'
import { Slug, Post } from './index'

const categorySlug = new Slug('category')

export class Category extends bookshelf.Model {
  get tableName() {
    return 'categories'
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

    if (model.hasChanged('name')) {
      const slug = await categorySlug.digest(name)
      model.set('slug', slug)
    }
  }

  posts() {
    return this.hasMany(Post)
  }

  count() {
    return this.hasMany(Post).query({ where: { status: 'published' } })
  }
}

export class Categories extends bookshelf.Collection {
  get model() {
    return Category
  }
}
