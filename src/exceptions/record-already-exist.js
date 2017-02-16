import Exception from './base'

export default class RecordAlreadyExist extends Exception {
  constructor(message = 'Record already exist') {
    super(message)
  }

  get name() {
    return 'Record already exist'
  }

  get status() {
    return 400
  }
}
