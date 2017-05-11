const jwt = require('jsonwebtoken')
const User = require('mongoose').model('User')
const PassportLocalStrategy = require('passport-local').Strategy

/**
 * Return the Passport Local Strategy object.
 */
module.exports = new PassportLocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: false,
    passReqToCallback: true
  },
  (req, email, password, done) => {
    const userData = {
      email: email.trim(),
      password: password.trim()
    }

    // find a user by email address
    return User.findOne({ email: userData.email }, (err, user) => {
      if (err) { return done(err) }
      // email not found
      if (!user) {
        const error = new Error('Incorrect email or password')
        error.name = 'IncorrectCredentialsError'

        return done(error)
      }
      // email found!
      // check if hashed user's password is equal to the value saved in the database
      return user.comparePassword(userData.password, (err, isMatch) => {
        if (err) { return done(err) }
        // password not found
        if (!isMatch) {
          const error = new Error('Incorrect email or password')
          error.name = 'IncorrectCredentialsError'

          return done(error)
        }
        // password match
        const payload = {
          sub: user._id
        }

        // create a token string
        const token = jwt.sign(payload, process.env.JWTSECRET)
        const data = {
          name: user.name
        }

        return done(null, token, data)
      })
    })
  }
)