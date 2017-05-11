const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    index: { unique: true }
  },
  password: String,
  name: String
})

/**
 * Add model custom method: compare password with the value in the database.
 *
 * @param {string} password
 * @returns {object} callback
 */
UserSchema.methods.comparePassword = function (password, callback) {
  bcrypt.compare(password, this.password, callback)
}

// The pre-save hook method:
UserSchema.pre('save', function (next) {
  const user = this
  const saltRounds = 8

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next()

  return bcrypt.hash(user.password, saltRounds,
    function (hashError, hash) {
      if (hashError) return next(hashError)

      // override the cleartext password with the hashed one
      user.password = hash
      next()
    }
  )
})

module.exports = mongoose.model('User', UserSchema)
