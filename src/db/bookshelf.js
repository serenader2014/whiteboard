import bookshelf from 'bookshelf'
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
  constructor (...args) {
    super(...args)

    eventList.forEach(event => {
      const functionName = 'on' + event.substring(0, 1).toUpperCase() + event.substring(1)

      if (this[functionName]) {
        this.on(event, this[functionName])
      }
    })
  }
}

export default blogBookshelf
