import Checkit from 'checkit'

export default class CategoryField {
  constructor(payload) {
    this.payload = payload
  }

  execute() {
    const nameRules = ['required', 'maxLength:30']

    const check = new Checkit({
      name: nameRules
    })

    return check.run(this.payload)
  }
}
