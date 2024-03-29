const jwt = require('jsonwebtoken')
const Admin = require('../../models/admin')

const auth = async (req, res, next) => {
  try {
    let token = req.header('Authorization')
    token = token.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET)
    const admin = await Admin.findOne({ _id: decoded._id, 'tokens.token': token })

    if (!admin) {
      throw new Error()
    }

    req.token = token
    req.admin = admin
    next()

  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' })
  }
}

module.exports = auth