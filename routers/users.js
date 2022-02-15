const express = require('express')
const User = require('../models/user')
const acc = require('../src/emails/account')

const router = new express.Router()

// Add a new user
router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    console.log("user saved")
    acc.sendWelcomeEmail(user.email, user.name)
    console.log("email sent")
    res.status(201).send(user)
  } 
  catch(error) {
    res.status(400).send(error)
  }
})

module.exports = router