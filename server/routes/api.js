const express = require('express')

const Biz = require('mongoose').model('Biz')

const router = new express.Router()

router.put('/addusr', (req, res) => {
  const bizId = req.body.biz
  const userName = req.userData.name
  const userEmail = req.userData.email

  const newBiz = Biz({ bizid: bizId, user: { name: userName, email: userEmail } })
  newBiz.save().then(biz => {
    console.log('NewBiz save: success!', biz)
    res.end()
  })
  .catch(err => {
    console.log('error adding user to biz:', err)
    res.end('error saving data', 500)
  })
})

router.put('/wipeusr', (req, res) => {
  const bizId = req.body.biz
  const userEmail = req.userData.email

  Biz.findOneAndRemove({bizid: bizId, 'user.email': userEmail})
  .then(data => console.log(data))
  .catch(err => {
    console.log('error removing user from biz\n', err)
    res.end('internal error', 500)
  })
  res.end()
})

module.exports = router
