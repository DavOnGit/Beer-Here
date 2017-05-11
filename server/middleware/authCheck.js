const jwt = require('jsonwebtoken')
const User = require('mongoose').model('User')

/**
 *  The Auth Checker middleware function.
 */
module.exports = (req, res, next) => {
  if (!req.headers.authorization && req.baseUrl === '/query') {
    return next()
  }

  if (!req.headers.authorization && req.baseUrl === '/api') {
    return res.status(401).end('not authorized')
  }

  // Get the last part from a authorization header string like "bearer token-value"
  const token = req.headers.authorization.split(' ')[1]

  // Decode the token using a secret key-phrase
  jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
    // User not authorized: continue with a normal query
    if (err && req.baseUrl === '/query') { return next() }
    // 401 code is for unauthorized status
    if (err) { return res.end('not authorized', 401) }

    const userId = decoded.sub

    if (req.baseUrl === '/api') {
      // Check if a user exists
      User.findById(userId, (userErr, user) => {
        if (userErr || !user) {
          return res.end('user not found', 404)
        }
        // Load user into req
        req.userData = user
        next()
      })
    } else if (req.baseUrl === '/query') {
      User.findById(userId, (userErr, user) => {
        if (userErr || !user) {
          return next()
        }

        req.userData = user
        next()
      })
    } else res.end('error: bad gateway', 502)
  })
}
