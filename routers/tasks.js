const express = require('express')
const Task = require('../models/task')
const auth = require('../src/middleware/auth')

const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    const user = req.user

    const task = new Task({
        ...req.body,
        owner: user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = (parts[1] == 'asc') ? 1 : -1
    }

    if (req.query.completed) {
        match.completed = (req.query.completed === 'true')
    }
    try {
        console.log('test')
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })

        res.send(req.user.tasks)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.delete('/tasks', auth, async (req, res) => {
    id = req.body
    try {
        const query = id
        const result = await Task.deleteOne(query)
        if (result.deletedCount === 1) {
            console.log("Successfully deleted one document.")
        } else {
            console.log("No documents matched the query. Deleted 0 documents.")
        }
        res.send()
    }
    catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks', auth, async (req, res) => {
    const mods = req.body
    delete mods._id
    const targetId = req.body._id
    const props = Object.keys(mods)
    const modifiable = ['title', 'description', 'completed']
    const isValid = props.every((prop) => modifiable.includes(prop))
    if (!isValid) {
        return res.status(400).send({ error: 'Invalid updates.'})
    }       
    
    try {
        const task = Task.find(targetId)
        console.log(task)
        props.forEach((prop) => task[prop] = mods[prop])
        await task.save()
        res.send(task)
    }
    catch (e) {
        res.status(500).send()
    }
})

module.exports = router