import bookshelf from '../db/bookshelf'
import { Category, User } from './index'

import PostField from '../service/validator/post-field'

export class Post extends bookshelf.Model {
  get tableName() {
    return 'posts'
  }

  static get defaultFields() {
    return {
      status: 'draft',
      created_at: new Date(),
      created_by: 0,
      featured: false,
      title: 'untitled'
    }
  }

  async onSaving(model, attrs, options) {
    await new PostField(model.attributes).execute()
  }

  category() {
    return this.belongsTo(Category)
  }

  user() {
    return this.belongsTo(User)
  }
}

export class Posts extends bookshelf.Collection {
  get model() {
    return Post
  }
}
