import bookshelf from 'bookshelf'
import _ from 'lodash'

import knex from './connection'

import resourceStructure from '../../data/resource-structure.json'

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

  static query(queryObject = {}, options) {
    return this.forge()
    .query('where', queryObject)
    .fetch(options)
  }

  static create(customFields, executor) {
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

    if (executor) {
      result.created_by = executor.id
    }

    return this.forge(result).save()
  }

  static async update(target, fields, executor) {
    const finalFields = _.extend({}, this.defaultFields, target.attributes, fields)

    finalFields.updated_at = new Date()
    if (executor) {
      finalFields.updated_by = executor.id
    }

    return target.save(finalFields)
  }

  // fix bookshelf hasChanged method
  hasChanged(attr) {
    if (attr == null) return !_.isEmpty(this.changed)
    if (typeof attr === 'string') return _.has(this.changed, attr)
    let result = false
    for (const i of attr) {
      result = _.has(this.changed, i)
      if (result) break
    }
    return result
  }

  json(isPermitted) {
    const tableName = this.tableName
    const structure = resourceStructure[tableName]
    const result = {}

    if (!structure) {
      return {}
    }
    Object.keys(structure).forEach((key) => {
      const option = structure[key]
      const accessControl = option.access
      const isRelatedData = option.related_data
      let allowed = false

      for (const i of accessControl) {
        if (i === 'public') {
          allowed = true
        }

        if (i === 'protected' && isPermitted) {
          allowed = true
        }

        if (allowed) {
          break
        }
      }

      const actualData = isRelatedData
        ? this.related(key).json()
        : this.attributes[key]
      result[key] = allowed ? actualData : null
    })
    return result
  }
}

blogBookshelf.Collection = class Collection extends blogBookshelf.Collection {
  constructor(...args) {
    super(...args)

    eventList.forEach(event => {
      const functionName = 'on' + event.substring(0, 1).toUpperCase() + event.substring(1)

      if (this[functionName]) {
        this.on(event, this[functionName])
      }
    })
  }

  static query(queryObject = {}, options) {
    return this.forge()
    .query('where', queryObject)
    .fetch(options)
  }
}

export default blogBookshelf
