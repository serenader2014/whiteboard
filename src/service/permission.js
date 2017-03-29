import { Role } from '../model'
import { DBError } from '../exceptions'

const expressionReg = /^(.+)(<|=|>)(.+)$/
const requesterPropertyReg = /^requester\.(\w+)/
const resourcePropertyReg = /^resource\.(\w+)/
const stringReg = /^('|")(\w+)('|")$/

export async function canThis(requester, actionType, objectType, resource) {
  let permissions = []
  if (requester === 'guest') {
    const Guest = await Role.query({ name: 'guest' })
    if (!Guest) throw new DBError('No guest role exist')

    permissions = (await Guest.permissions().fetch()).toJSON()
  } else {
    permissions = await requester.permissions()
  }
  let result = false

  for (let permission of permissions) {
    if (permission.object_type === objectType && permission.action_type === actionType) {
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
          rightExpression = (await resource[rightResourceMatch[1]]) || resource.get(rightResourceMatch[1])
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

export async function generatePermissionQuery(requester, actionType, objectType) {
  const permissions = await requester.permissions()
  let result = []
  for (let permission of permissions) {
    if (permission.object_type === objectType && permission.action_type === actionType) {
      if (permission.condition) {
        const matchResult = permission.condition.match(expressionReg)
        if (!matchResult) continue
        const left = matchResult[1]
        const condition = matchResult[2]
        const right = matchResult[3]

        let key
        let value

        const leftRequesterMatch = left.match(requesterPropertyReg)
        const rightResourceMatch = right.match(resourcePropertyReg)

        if (leftRequesterMatch) {
          value = await requester[leftRequesterMatch[1]]
        }

        if (rightResourceMatch) {
          key = rightResourceMatch[1]
        }

        result = [key, condition, value]
      }
      break
    }
  }

  return result
}
