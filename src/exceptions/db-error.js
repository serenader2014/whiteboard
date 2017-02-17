import Exception from './base'

export class DBError extends Exception {
  constructor(message = 'DB encounter an error') {
    super(message)
  }

  get name() {
    return 'DBError'
  }

  get status() {
    return 502
  }
}
