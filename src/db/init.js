import createTable from './create-table'
import schemas from './schemas'

export default async function() {
  for (let model of Object.keys(schemas)) {
    try {
      await createTable(model, schemas[model])
    } catch (e) {
      console.log(e)
    }
  }
}
