import Checkit from 'checkit'
import { User } from '../../model'
import { RecordAlreadyExist } from '../../exceptions'

export default class UserField {
  constructor(payload, checkEmailIsExist = false) {
    this.payload = payload
    this.checkEmailIsExist = checkEmailIsExist
  }

  execute() {
    const emailRule = ['required', 'email']
    const passwordRule = ['minLength:6', 'maxLength:20', 'required']
    const usernameRule = ['maxLength:20']

    if (this.checkEmailIsExist) {
      emailRule.push(async email => {
        const targetUser = await User.checkIfExist({ email })
        if (targetUser) throw new RecordAlreadyExist(`email already exist: ${email}`)
      })
    }

    const rules = new Checkit({
      email: emailRule,
      password: passwordRule,
      username: usernameRule
    })

    return rules.run(this.payload)
  }
}

