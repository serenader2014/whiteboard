import bookshelf from 'bookshelf'
import _ from 'lodash'

import knex from './connection'

import resourceStructure from '../../data/resource-structure.json'

import { RecordNotFound } from '../exceptions'

const expressionReg = /^(.+)(<|=|>)(.+)$/
const userPropertyReg = /^user\.(\w+)/
const resourcePropertyReg = /^resource\.(\w+)/
const stringReg = /^('|")(\w+)('|")$/

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

    return this.forge(result).save()
  }

  static async update(id, fields, executor) {
    const target = await this.query({ id })
    if (!target) throw new RecordNotFound(`Can not find target resource: id:${id}`)
    const finalFields = _.pick(_.extend({}, this.defaultFields, target.attributes, fields), this.availableFields)

    return target.save(finalFields)
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

export default blogBookshelf
