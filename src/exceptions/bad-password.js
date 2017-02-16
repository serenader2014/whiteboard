import Exception from './base'

export default class BadPassword extends Exception {
  constructor(message = 'Invalid password') {
    super(message)
  }

  get name() {
    return 'BadPasswordError'
  }

  get status() {
    return 401
  }
}
