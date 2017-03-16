import Checkit from 'checkit'
import { User } from '../../model'
import { RecordAlreadyExist } from '../../exceptions'

export default class UserField {
  constructor(payload, checkEmailIsExist = false, omitPassword = false) {
    this.payload = payload
    this.checkEmailIsExist = checkEmailIsExist
    this.omitPassword = omitPassword
  }

  execute() {
    const emailRule = ['required', 'email']
    const passwordRule = ['minLength:6', 'maxLength:20', 'required']
    const usernameRule = ['maxLength:20']
    const statusRule = [val => {
      if (['active', 'inactive', 'deleted'].indexOf(val) === -1) {
        throw new Error(`Invalid status type: ${val}`)
      }
    }]

    if (this.checkEmailIsExist) {
      emailRule.push(async email => {
        const targetUser = await User.checkIfExist({ email })
        if (targetUser) throw new RecordAlreadyExist(`email already exist: ${email}`)
      })
    }

    const rules = {
      email: emailRule,
      username: usernameRule,
      status: statusRule
    }

    if (!this.omitPassword) {
      rules.password = passwordRule
    }

    const check = new Checkit(rules)

    return check.run(this.payload)
  }
}
