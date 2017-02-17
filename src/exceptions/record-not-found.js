import Exception from './base'

export class RecordNotFound extends Exception {
  constructor (message = 'Record not found') {
    super(message)
  }

  get name () {
    return 'RecordNotFoundError'
  }

  get status () {
    return 404
  }
}
