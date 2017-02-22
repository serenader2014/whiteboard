import { Role } from '../model'
import { DBError } from '../exceptions'

const expressionReg = /^(.+)(<|=|>)(.+)$/
const requesterPropertyReg = /^requester\.(\w+)/
const resourcePropertyReg = /^resource\.(\w+)/
const stringReg = /^('|")(\w+)('|")$/

export async function canThis(requester, action, resource) {
  let permissions = []
  if (requester === 'guest') {
    const Guest = await Role.query({ name: 'guest' })
    if (!Guest) throw new DBError('No guest role exist')

    permissions = (await Guest.permissions().fetch({ withRelated: 'permissions' })).toJSON()
  } else {
    permissions = await requester.permissions()
  }
  let result = false

  for (let permission of permissions) {
    if (permission.object_type === resource.resourceName && permission.action_type === action) {
      if (permission.condition) {
        // requester.id=resource.id
        const matchResult = permission.condition.match(expressionReg)
        if (!matchResult) continue
        const left = matchResult[1]
        const condition = matchResult[2]
        const right = matchResult[3]

        let leftExpression
        let rightExpression

        const leftRequesterMatch = left.match(requesterPropertyReg)
        const rightResourceMatch = right.match(resourcePropertyReg)
        const rightStringMatch = right.match(stringReg)

        if (leftRequesterMatch) {
          leftExpression = await requester[leftRequesterMatch[1]]
        }

        if (rightResourceMatch) {
          rightExpression = await resource[rightResourceMatch[1]]
        }

        if (rightStringMatch) {
          rightExpression = rightStringMatch[2]
        }

        switch (condition) {
          case '=':
          default:
            /* eslint-disable eqeqeq */
            result = leftExpression == rightExpression
        }
      } else {
        result = true
      }
    }

    if (result) {
      break
    }
  }
  return result
}