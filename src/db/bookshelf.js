import bookshelf from 'bookshelf'
import _ from 'lodash'
import gql from 'ghost-gql'

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

  static async list(options, qbCallback = () => {}, validateFilter = filters => filters) {
    const defaultOptions = {
      filter: null,
      order: '',
      pageSize: 10,
      page: 1,
      include: null
    }
    options = _.pickBy({
      ...defaultOptions,
      ...options
    }, value => !!value)

    let filters = null
    if (options.filter) {
      try {
        filters = validateFilter(gql.parse(options.filter))
      } catch (e) {
        console.log('parse filter error, will skip the filter', e)
      }
    }
    const fetchOptions = {
      pageSize: options.pageSize,
      page: options.page
    }
    if (options.include) {
      fetchOptions.withRelated = _.filter(options.include.split(','), item => !!item)
    }
    const result = await this.forge().query(qb => {
      if (filters) {
        gql.knexify(qb, filters)
      }
      qbCallback(qb)
    })
    .orderBy(options.order)
    .fetchPage(fetchOptions)

    return {
      pagination: result.pagination,
      data: result.map(model => model.json())
    }
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

    finalFields.updated_at = new Date().getTime()
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

      let data = null
      if (allowed) {
        if (isRelatedData) {
          data = this.related(key).get('id') ? this.related(key).json() : {}
        } else {
          data = this.attributes[key]
        }
      }

      result[key] = data
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
