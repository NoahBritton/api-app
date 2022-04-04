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
        type: String,
        default: "false"
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true })

taskSchema.methods.toJSON = function () {
  console.log("entered Task toJSON method")
  const task = this

  const taskObject = task.toObject()

  delete taskObject.__v
  console.log("Task version num deleted")

  return taskObject
}

const Task = mongoose.model('Task', taskSchema);

module.exports = Task