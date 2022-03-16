const mongoose = require('mongoose')
const User = require('./user')

const Schema = mongoose.Schema

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true })

userSchema.methods.toJSON = function () {
  console.log("entered toJSON method")
  const task = this

  const taskObject = task.toObject()

  delete userObject.__v
  console.log("version num deleted")

  return userObject
}

const Task = mongoose.model('Task', taskSchema);

module.exports = Task