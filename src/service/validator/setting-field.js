import Checkit from 'checkit'
import _ from 'lodash'

export default class SettingField {
  constructor(payload) {
    this.payload = payload
  }

  execute() {
    const typeRules = ['required', function(value) {
      // currently only accept core setting
      if (!_.includes(['core', 'blog'], value)) {
        throw new Error(`Invalid setting type: ${value}`)
      }
    }]

    const keyRules = ['required']
    const valueRules = ['required']

    if (this.payload.key === 'default_role') {
      valueRules.push(value => {
        if (!_.includes(['admin', 'user', 'guest'], value)) {
          throw new Error(`Invalid default role: ${value}`)
        }
      })
    }

    const check = new Checkit({
      type: typeRules,
      key: keyRules,
      value: valueRules
    })

    return check.run(this.payload)
  }
}
