import htmlToText from 'html-to-text'

import bookshelf from '../db/bookshelf'
import { Category, User, Slug } from './index'

import PostField from '../service/validator/post-field'

const postSlug = new Slug('post')

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

    if (model.hasChanged('title')) {
      const slug = await postSlug.digest(model.attributes.title)
      model.set('slug', slug)
    }

    if (model.hasChanged('status')) {
      model.set('publish_at', model.get('status') === 'published' ? new Date() : 0)
    }

    if (model.hasChanged('html')) {
      const excerpt = htmlToText.fromString(model.get('html'))
      model.set('excerpt', excerpt.length > 250 ? `${excerpt} ...` : excerpt)
    }
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
