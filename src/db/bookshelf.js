import bookshelf from 'bookshelf'
import _ from 'lodash'

import knex from './connection'

import resourceStructure from '../../data/resource-structure.json'

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

  structure(currentUser) {
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
          break
        }

        const expressionMatchResult = i.match(expressionReg)
        if (!expressionMatchResult) {
          continue
        }

        const left = expressionMatchResult[1]
        const condition = expressionMatchResult[2]
        const right = expressionMatchResult[3]
        let leftExpression
        let rightExpression

        const leftUserMatchResult = left.match(userPropertyReg)
        const leftResourceMatchResult = left.match(resourcePropertyReg)
        const rightUserMatchResult = right.match(userPropertyReg)
        const rightResourceMatchResult = right.match(resourcePropertyReg)
        const rightStringMatchResult = right.match(stringReg)

        if (leftUserMatchResult) {
          leftExpression = currentUser ? currentUser[leftUserMatchResult[1]] : null
        }

        if (leftResourceMatchResult) {
          leftExpression = this[leftResourceMatchResult[1]]
        }

        if (rightUserMatchResult) {
          rightExpression = currentUser ? currentUser[rightUserMatchResult[1]] : null
        }

        if (rightResourceMatchResult) {
          rightExpression = this[rightResourceMatchResult[1]]
        }

        if (rightStringMatchResult) {
          rightExpression = rightStringMatchResult[2]
        }

        switch (condition) {
          case '<': {
            allowed = leftExpression < rightExpression
            break
          }
          case '>': {
            allowed = leftExpression > rightExpression
            break
          }
          case '=':
          default: {
            /* eslint-disable eqeqeq */
            allowed = leftExpression == rightExpression
            break
          }
        }

        if (allowed) {
          break
        }
      }

      const actualData = isRelatedData
        ? this.related(key).structure(currentUser)
        : this.attributes[key]
      result[key] = allowed ? actualData : null
    })
    return result
  }
}

export default blogBookshelf
