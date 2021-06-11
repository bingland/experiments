const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const init = (passport, getUserByEmail, getUserById) => {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email)
    // check if user exists
    if (user == null) {
      console.log('no user found for ' + email)
      return done(null, false, { message: 'No user with that email' })
    }

    // check passcode
    try {
      if (await bcrypt.compare(password, user.password)) { // does this return true?
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect'})
      }
    } catch (e) {
      return done(e)
    } 
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => { done(null, user.id) })
  passport.deserializeUser((id, done) => { done(null, getUserById(id)) })
}

module.exports = init