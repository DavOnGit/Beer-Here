const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')
const path = require('path')

let DBconf = null
try {
  DBconf = require('./server/config/index.js')
  if (!DBconf) return
  process.env.DBURI = DBconf.DBURI
  process.env.JWTSECRET = DBconf.JWTSECRET
  process.env.YELPID = DBconf.YELPID
  process.env.YELPSECRET = DBconf.YELPSECRET
} catch (e) {
  console.log(e, process.env.DBURI)
}

const IS_DEV = process.env.NODE_ENV === 'development'
const PORT = process.env.PORT || 8080
const HOST = process.env.HOST || 'localhost'

if (IS_DEV) {
  require('piping')({ main: './server.js', hook: true })
}

// Load models and connect mongoose to the database
require('./server/models/').DBconnection(process.env.DBURI)

const app = express()
console.log(`App.js starting in ${app.settings.env.toUpperCase()} mode`)

// tell the app to parse HTTP body messages & application/json
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// initialize passport middleware
app.use(passport.initialize())

// load passport strategies
const localSignupStrategy = require('./server/passport/local-signup')
const localLoginStrategy = require('./server/passport/local-login')
passport.use('local-signup', localSignupStrategy)
passport.use('local-login', localLoginStrategy)

// API authentication checker middleware
const authCheckMiddleware = require('./server/middleware/authCheck')
app.use(['/query', '/api'], authCheckMiddleware)

// routes
const locRoutes = require('./server/routes/query')
const authRoutes = require('./server/routes/auth')
const apiRoutes = require('./server/routes/api')

app.use('/query', locRoutes)
app.use('/auth', authRoutes)
app.use('/api', apiRoutes)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}

const httpServer = app.listen(PORT, () => {
  console.log(`Micro-App on ${HOST}:${PORT} [${app.settings.env}]`)
})

process.on('SIGTERM', () => {
  httpServer.close(() => {
    process.exit(0)
  })
})
