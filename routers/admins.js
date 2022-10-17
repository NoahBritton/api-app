const express = require('express')
const Admin = require('../models/admin')
const auth = require('../src/middleware/auth')

const router = new express.Router()

// Add a new admin
router.post('/admins', async (req, res) => {
  const admin = new Admin(req.body)

  try {
    await admin.save()
    const token = await admin.generateAuthToken()

    res.status(201).send({ admin, token })
  }
  catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
})

router.post('/admins/logout', auth, async (req, res) => {
  try {
    req.admin.tokens = req.admin.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.admin.save()

    res.send()
  }
  catch (e) {
    res.status(500).send()
  }
})

router.post('/admins/login', async (req, res) => {

  try {
    const admin = await Admin.findByCredentials(req.body.email, req.body.password)
    const token = await admin.generateAuthToken()
    res.status(200).send({admin, token})
  } 
  catch (e) {    
    res.status(400).send()
  }
})

router.get('/admins/me', auth, async (req, res) => {
  res.send(req.admin)
})

router.patch('/admins/me', auth, async(req, res) => {
  const mods = req.body
  const props = Object.keys(mods)
  const modifiable = ['password']
  const isValid = props.every((prop) => modifiable.includes(prop))

  if (!isValid) {
      return res.status(400).send({ error: 'Invalid updates.' })
  }

  try {
      const admin = req.admin
      props.forEach((prop) => admin[prop] = mods[prop])
      await admin.save()
      res.send(admin)
  } catch (e) {
      res.status(400).send()
  }
})

router.delete('/admins/me', auth, async(req, res) => {
  try {
    await req.admin.deleteOne()
    res.send(req.admin)
  } 
  catch (e) {
    console.log(e)
    res.status(500).send()
  }
})

module.exports = router