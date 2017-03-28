import Exception from './base'

export class TemplateError extends Exception {
  constructor(message = 'Template encounter an error') {
    super(message)
  }

  get name() {
    return 'TemplateError'
  }

  get status() {
    return 500
  }
}
