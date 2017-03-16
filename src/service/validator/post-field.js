import Checkit from 'checkit'
import _ from 'lodash'

export default class PostField {
  constructor(payload) {
    this.payload = payload
  }

  execute() {
    const titleRules = ['required', 'maxLength:150']
    const featureRules = ['required', 'boolean']
    const statusRules = ['required', function(value) {
      if (!_.includes(['draft', 'published', 'deleted'], value)) {
        throw new Error(`Invalid post status type: ${value}`)
      }
    }]
    const categoryRules = ['required']
    const userRules = ['required']

    const check = new Checkit({
      title: titleRules,
      featured: featureRules,
      status: statusRules,
      category_id: categoryRules,
      user_id: userRules
    })

    return check.run(this.payload)
  }
}
