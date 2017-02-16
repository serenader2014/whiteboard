import Exception from './base'

export default class RecordNotFound extends Exception {
  constructor(message = 'Record not found') {
    super(message)
  }

  get name() {
    return 'RecordNotFoundError'
  }

  get status() {
    return 404
  }
}
