const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

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
  }
})

userSchema.methods.toJSON = function () {
  console.log("entered toJSON method")
  const user = this

  const userObject = user.toObject()

  delete userObject.password
  console.log("password deleted")
  delete userObject.__v
  console.log("version num deleted")

  return userObject
}

userSchema.pre('save', async function(next) {
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