import createTable from './create-table'
import schemas from './schemas'

export default () => Object.keys(schemas).reduce((promise, model) => promise.then(() => {
  return createTable(model, schemas[model]).catch(e => {})
}), Promise.resolve())
