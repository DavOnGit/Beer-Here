const mongoose = require('mongoose')

module.exports.DBconnection = uri => {
  /*
  / Configure mongoose connction:
  /
  / NOTE: mongoose docs reccommends to swith autoindex to false in prod for
  / performance concerns, but this is not allways true. Check this:
  / http://stackoverflow.com/questions/14342708/mongoose-indexing-in-production-code
  */
  mongoose.connect(uri,
    {
      config: { autoIndex: true },
      server: { reconnectTries: Number.MAX_VALUE, reconnectInterval: 3000 }
    })

  // Plug in a promise library:
  mongoose.Promise = global.Promise

  mongoose.connection.on('error', err => {
    console.error(`Could not connect to MongoDB: ${err}`)
  })

  mongoose.connection.on('disconnected', function () {
    console.log('Lost MongoDB connection...')
  })

  mongoose.connection.on('connected', function () {
    console.log('Connection established to MongoDB')
  })

  mongoose.connection.on('reconnected', () => {
    console.log('Reconnected to MongoDB')
  })

  // Close the Mongoose connection, when receiving SIGINT
  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      console.log('Force close the MongoDB conection')
      process.exit(0)
    })
  })

  // Load Models:
  require('./user')
  require('./biz')
}
