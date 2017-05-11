const mongoose = require('mongoose')
const Schema = mongoose.Schema

// list of populated places (bizs)
const bizSchema = new Schema({
  // Yelp biz ID
  bizid: { type: String, required: true },
  // map user to biz
  user: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now(), expires: '12h' }
})

bizSchema.index({ bizid: 1, 'user.email': 1, name: 1 }, { unique: true })

module.exports = mongoose.model('Biz', bizSchema)
