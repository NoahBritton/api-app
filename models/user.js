const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Schema = mongoose.Schema

const userSchema = new Schema({
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
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
})

userSchema.methods.generateAuthToken = async function () {
  const user = this

  const token = jwt.sign({ _id: user._id.toString() }, process.env.JSON_WEB_TOKEN_SECRET)

  user.tokens = user.tokens.concat({ token })
  await user.save()

  return token
}

userSchema.statics.findByCredentials = async (email, password) => {       
  const user = await User.findOne({email}) 
  if (!user) { 
    throw new Error('Unable to login') 
  } 
  const isMatch = await bcrypt.compare(password, user.password) 
  if (!isMatch) { 
    throw new Error('Unable to login') 
  } 
  return user 
}

userSchema.methods.toJSON = function () {
  console.log("entered toJSON method")
  const user = this

  const userObject = user.toObject()

  delete userObject.password
  console.log("password deleted")
  delete userObject.__v
  console.log("version num deleted")
  delete userObject.tokens
  console.log("tokens deleted")

  return userObject
}

userSchema.pre('save', async function (next) {
  console.log("entered pre Save method")
  const user = this

  if (user.isModified('password')) {
    console.log("encrypting password")
    user.password = await bcrypt.hash(user.password, 8)
    console.log("password encrypted")
  }
  console.log("going into save method")
  next()  // run the save() method
})

const User = mongoose.model('user', userSchema);

module.exports = User