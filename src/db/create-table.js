import knex from './connection'

export default function createTable (tableName, schema) {
  return knex.schema.createTableIfNotExists(tableName, table => {
    Object.keys(schema).forEach(key => {
      let column
      const columnSpec = schema[key]

      if (columnSpec.type === 'text' && columnSpec.hasOwnProperty('fieldtype')) {
        column = table[columnSpec.type](key, columnSpec.fieldtype)
      } else if (columnSpec.type === 'string' && columnSpec.hasOwnProperty('maxlength')) {
        column = table[columnSpec.type](key, columnSpec.maxlength)
      } else {
        column = table[columnSpec.type](key)
      }

      if (columnSpec.hasOwnProperty('nullable') && columnSpec.nullable === true) {
        column.nullable()
      } else {
        column.notNullable()
      }
      if (columnSpec.hasOwnProperty('primary') && columnSpec.primary === true) {
        column.primary()
      }
      if (columnSpec.hasOwnProperty('unique') && columnSpec.unique) {
        column.unique()
      }
      if (columnSpec.hasOwnProperty('unsigned') && columnSpec.unsigned) {
        column.unsigned()
      }
      if (columnSpec.hasOwnProperty('references')) {
        // check if table exists?
        column.references(columnSpec.references)
      }
      if (columnSpec.hasOwnProperty('defaultTo')) {
        column.defaultTo(columnSpec.defaultTo)
      }
    })
  })
}
