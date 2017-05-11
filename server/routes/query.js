const express = require('express')
const request = require('request')

const BizCollection = require('mongoose').model('Biz')

// Get Yelp token and cache it
var yelpCache = null

var yelpCredential = () => {
  request.post({
    url: 'https://api.yelp.com/oauth2/token',
    form: {
      grant_type: 'client_credentials',
      client_id: process.env.YELPID,
      client_secret: process.env.YELPSECRET
    }},
    function (err, response, body) {
      if (err) {
        console.log('yelp credential request error', err)
        setTimeout(() => yelpCredential(), 3000)
      }
      try {
        yelpCache = JSON.parse(body)
        console.log('Yelp token req: OK!')
      } catch (error) {
        console.log('error parsing yelp credential', error)
        setTimeout(() => yelpCredential(), 3000)
      }

      // Set token refresh timer
      // NOTE: max timeout span 2147483647 millis ~= 24.8 days
      const max = 2147483647
      const expire = (yelpCache.expires_in + 1) * 1000
      const timer = expire <= max ? expire : max

      setTimeout(() => { yelpCredential() }, timer)
    }
  )
}
yelpCredential()

const router = new express.Router()
const yelpSearch = 'https://api.yelp.com/v3/businesses/search'

router.get('/:location', (req, res) => {
  if (yelpCache === null) {
    console.log('error, yelpToken not found')
    res.end('internal error', 500)
  }

  // Configure request to query Yelp API
  const href = `${yelpSearch}?location=${req.params.location}&limit=50&term=breweries`
  const yToken = `${yelpCache.token_type} ${yelpCache.access_token}`

  let yelpData = ''

  request({
    url: href,
    headers: { Authorization: yToken },
    encoding: 'utf8'
  })
  .on('error', function (err) {
    console.log(err)
    res.end('error fetching yelp API', 503)
  })
  .on('data', data => { yelpData += data })
  .on('end', () => {
    // If req comes from unauthenticated user send back only yelp results
    if (typeof req.userData !== 'object') {
      return res.send(yelpData)
    }

    // Req comes from authenticated user so send also list of users to biz
    const jsonData = () => {
      try {
        return JSON.parse(yelpData)
      } catch (e) { res.end('error parsing yelp response', 500) }
    }

    // Array of yelp biz id, used as filter
    const requestedBizs = jsonData().businesses.map(biz => biz.id)

    // Extract requestedBizs from the biz collection
    BizCollection.find({bizid: {$in: requestedBizs}}, {_id: 0, createdAt: 0})
    .then(bizList => {
      const purgedEmails = bizList.map(biz => {
        if (biz.user.email === req.userData.email) { return biz }
        biz.user.email = undefined
        return biz
      })
      console.log(req.userData.email, purgedEmails)
      const payload = jsonData()
      payload.userstobiz = purgedEmails

      res.json(payload)
    })
    .catch(err => console.log(err))
  })
})

module.exports = router
