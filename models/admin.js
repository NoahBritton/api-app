const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema

const adminSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid.')
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 8
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
})

adminSchema.methods.generateAuthToken = async function () {
  const admin = this

  const token = jwt.sign({ _id: admin._id.toString() }, process.env.JSON_WEB_TOKEN_SECRET)

  admin.tokens = admin.tokens.concat({ token })
  await admin.save()

  return token
}

adminSchema.statics.findByCredentials = async (email, password) => {       
  const admin = await User.findOne({email}) 
  if (!admin) { 
    throw new Error('Unable to login') 
  } 
  const isMatch = await bcrypt.compare(password, admin.password) 
  if (!isMatch) { 
    throw new Error('Unable to login') 
  } 
  return admin 
}

adminSchema.methods.toJSON = function() {
  const admin = this
  const adminObject = admin.toObject()
  
  delete adminObject.password
  delete adminObject.tokens
  delete adminObject.__v
  
  return adminObject
}

adminSchema.pre('save', async function (next) {
  console.log("entered pre Save method")
  const admin = this

  if (admin.isModified('password')) {
    admin.password = await bcrypt.hash(admin.password, 8)
  }
  next()
})

adminSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  next()
})

const User = mongoose.model('admin', adminSchema);

module.exports = User