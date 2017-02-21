import passport from 'koa-passport'
import { User } from '../model'
import { Strategy } from 'passport-local'

export default function setUpPassport() {
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.query({ id })
      if (!user) done('User not found')
      done(null, user)
    } catch (e) {
      done(e)
    }
  })

  passport.use('local', new Strategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const targetUser = await User.query({ email })
      if (!targetUser) return done(null, false, { message: 'User not found' })
      const isPasswordCorrect = await targetUser.validatePassword(password)
      if (!isPasswordCorrect) return done(null, false, { message: 'Password incorrect' })
      return done(null, targetUser)
    } catch (e) {
      return done(e)
    }
  }))
}
