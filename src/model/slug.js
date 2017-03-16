import unidecode from 'unidecode'
import crypto from 'crypto'

export class Slug {
  constructor(type, hasHash) {
    this.hasHash = hasHash
    this.type = type
  }

  async checkIfExist(slug) {
    /* eslint-disable global-require */
    switch (this.type) {
      case 'user':
        return await require('./users').User.query({ slug })
      case 'post':
        return await require('./posts').Post.query({ slug })
      case 'category':
        return await require('./categories').Category.query({ slug })
      default:
        return Promise.reject(`slug type must be either \`user\`
       or \`post\` or \`category\``)
    }
  }

  generateHash(text) {
    const md5 = crypto.createHash('md5')
    md5.update(text)
    return md5.digest('hex')
  }

  generateUnidecode(text) {
    return unidecode(text)
    .toLowerCase()
    .replace(/(\s+)|(\W+)/g, '-')
    .replace(/(^-)|(-$)/, '')
  }

  async digest(text, count) {
    let slug = this.generateUnidecode(text)
    const salt = new Date().getTime() + Math.floor(Math.random() * 10000)
    slug = this.hasHash
      ? `${slug}-${this.generateHash(slug + salt).substring(0, 8)}`
      : `${slug}${count ? `${-count}` : ''}`
    const isExist = await this.checkIfExist(slug)

    const c = count ? count + 1 : 1

    if (isExist) return this.digest(text, this.hasHash ? null : c)

    return slug
  }
}
