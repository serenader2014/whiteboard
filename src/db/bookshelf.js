import bookshelf from 'bookshelf'
import _ from 'lodash'

import knex from './connection'

const eventList = [
  'counting',
  'created',
  'creating',
  'destroyed',
  'destroying',
  'fetched',
  'fetching',
  'saved',
  'saving',
  'updated',
  'updating'
]

const blogBookshelf = bookshelf(knex)
blogBookshelf.plugin('pagination')

blogBookshelf.Model = class Model extends blogBookshelf.Model {
  constructor(...args) {
    super(...args)

    eventList.forEach(event => {
      const functionName = 'on' + event.substring(0, 1).toUpperCase() + event.substring(1)

      if (this[functionName]) {
        this.on(event, this[functionName])
      }
    })
  }

  static query(queryObject, options) {
    return this.forge()
    .query('where', queryObject)
    .fetch(options)
  }

  static create(customFields) {
    const fields = _.extend({}, this.defaultFields, customFields)
    const plainObject = {}

    Object.keys(fields).forEach(key => {
      if (!_.isFunction(fields[key])) {
        plainObject[key] = fields[key]
      }
    })

    const result = _.mapValues(fields, val => {
      if (typeof val === 'function') {
        return val(plainObject)
      } else {
        return val
      }
    })

    return this.forge(result).save()
  }
}

export default blogBookshelf
