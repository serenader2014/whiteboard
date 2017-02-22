import Exception from './base'

export class OperationNotPermitted extends Exception {
  constructor(message = 'Current operation is not permitted') {
    super(message)
  }

  get name() {
    return 'Operation Not Permitted'
  }

  get status() {
    return 403
  }
}
