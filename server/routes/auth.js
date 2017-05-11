const express = require('express')
const validator = require('validator')
const passport = require('passport')

const BizCollection = require('mongoose').model('Biz')

const router = new express.Router()

/**
 * Validate the sign up form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateSignupForm (email, password, name) {
  const errors = {}
  let isFormValid = true
  let message = ''

  if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
    isFormValid = false
    errors.email = 'Please provide a correct email address.'
  }

  if (!password || typeof password !== 'string' || password.trim().length < 8) {
    isFormValid = false
    errors.password = 'Password must have at least 8 characters.'
  }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    isFormValid = false
    errors.name = 'Please provide your name.'
  }

  if (!isFormValid) {
    message = 'Check the form for errors.'
  }

  return {
    success: isFormValid,
    message,
    errors
  }
}

/**
 * Validate the login form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateLoginForm (email, password) {
  const errors = {}
  let isFormValid = true
  let message = ''

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    isFormValid = false
    errors.email = 'Please provide your email address.'
  }

  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    isFormValid = false
    errors.password = 'Please provide your password.'
  }

  if (!isFormValid) {
    message = 'Check the form for errors.'
  }

  return {
    success: isFormValid,
    message,
    errors
  }
}

router.post('/signup', (req, res, next) => {
  const { email, password, name } = req.body
  const validationResult = validateSignupForm(email, password, name)

  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    })
  }

  passport.authenticate('local-signup', (err) => {
    if (err) {
      // the 11000 Mongo code is for a duplication email error
      if (err.name === 'MongoError' && err.code === 11000) {
        // the 409 HTTP status code is for conflict error
        return res.status(409).json({
          success: false,
          message: 'Check the form for errors.',
          errors: {
            email: 'This email is already taken.'
          }
        })
      }

      return res.status(400).json({
        success: false,
        message: 'Could not process the form.'
      })
    }

    res.status(200).json({
      success: true,
      message: 'You have successfully signed up! Now you should be able to log in.'
    })
  })(req, res, next)
})

router.post('/login', (req, res, next) => {
  const { email, password, bizlist } = req.body
  const validationResult = validateLoginForm(email, password)

  if (!validationResult.success) {
    console.log('validation error', validationResult)
    return res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    })
  }

  passport.authenticate('local-login', (err, token, userData) => {
    if (err) {
      if (err.name === 'IncorrectCredentialsError') {
        return res.status(400).json({
          success: false,
          message: err.message
        })
      }

      return res.status(400).json({
        success: false,
        message: 'Could not process the form.'
      })
    }

    const requestedBizs = () => {
      try { return JSON.parse(bizlist) } catch (err) {
        console.log('parse error: invalid json bizlist\n' + err.message)
        return []
      }
    }

    // Send a list of users to biz
    BizCollection.find({bizid: {$in: requestedBizs()}}, {_id: 0, createdAt: 0})
    .then(bizList => {
      // Purge other users emails
      const payload = bizList.map(biz => {
        if (biz.user.email === email) { return biz }
        biz.user.email = undefined
        return biz
      })

      res.json({
        success: true,
        payload,
        token,
        user: userData
      })
    })
    .catch(err => {
      console.log(err)
      res.end('internal error', 500)
    })
  })(req, res, next)
})

module.exports = router
