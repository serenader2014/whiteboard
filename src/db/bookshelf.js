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

  static query(queryObject = {}, options, orderBy = 'id') {
    return this.forge()
    .query('where', queryObject)
    .orderBy(orderBy)
    .fetch(options)
  }

  static async list(options, qbCallback = () => {}, filtersFn = {}) {
    const defaultOptions = {
      filter: null,
      order: '',
      pageSize: '10',
      page: '1',
      include: null
    }
    options = _.pickBy({
      ...defaultOptions,
      ...options
    }, value => !!value)

    filtersFn.validateFilter = filtersFn.validateFilter || (filter => filter)
    filtersFn.validateInclude = filtersFn.validateInclude || (include => include)
    filtersFn.validateOrder = filtersFn.validateOrder || (order => order)

    let filters = null
    if (options.filter) {
      try {
        filters = filtersFn.validateFilter(gql.parse(options.filter))
      } catch (e) {
        console.log('parse filter error, will skip the filter', e)
      }
    }
    const fetchOptions = {
      pageSize: options.pageSize,
      page: options.page
    }
    if (options.include) {
      fetchOptions.withRelated = filtersFn.validateInclude(_.filter(options.include.split(','), item => !!item))
    }
    const order = filtersFn.validateOrder(options.order)

    const result = await this.forge().query(qb => {
      if (filters) {
        gql.knexify(qb, filters)
      }
      typeof qbCallback === 'function' && qbCallback(qb)
    })
    .orderBy(order)
    .fetchPage(fetchOptions)

    return {
      data: result.map(model => model.json()),
      meta: {
        ...result.pagination,
        order,
        filters
      }
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

  json() {
    const tableName = this.tableName
    const structure = resourceStructure[tableName]
    const result = {}

    if (!structure) {
      return {}
    }
    Object.keys(structure).forEach((key) => {
      const option = structure[key]
      const isRelatedData = option.related_data

      let data = null

      if (isRelatedData) {
        data = this.related(key).get('id') ? this.related(key).json() : {}
      } else {
        data = this.attributes[key]
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

  static query(queryObject = {}, options, orderBy = 'id') {
    return this.forge()
    .query('where', queryObject)
    .orderBy(orderBy)
    .fetch(options)
  }
}

export default blogBookshelf
