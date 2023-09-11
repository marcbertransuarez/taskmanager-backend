const router = require("express").Router();
const Task = require('../models/Task');
const User = require ('../models/User');
const { isAuthenticated } = require('../middlewares/jwt');


//route to get all task

router.get('/', isAuthenticated, async (req, res, next) => {
    const userId = req.payload._id
    try {
        const tasks = await Task.find({ user: userId})
        res.status(200).json(tasks)
    } catch (error) {
        res.status(400).json({ message: 'error getting all the tasks'})
    }
})


// route to create a task

router.post('/', isAuthenticated , async (req, res, next) => {
    const user = req.payload
    const { content, state } = req.body;
    try {
        const newTask = await Task.create({content, state, user})
        res.status(201).json({data: newTask})
    } catch (error) {
        res.status(400).json({ message: `error creating a new task - ${error.message}`})
    }
})
//route to edit a task state

router.put('/:taskId', async (req, res, next) => {
    const taskId = req.params.taskId;
    const { state } = req.body
    try {
        const updatedTaskState = await Task.findByIdAndUpdate(taskId, { state }, { new: true })
        res.status(200).json(updatedTaskState)
    } catch (error) {
        res.status(400).json({ message: `error updating a new task - ${error.message}`})
    }
})

//route to delelte a task

router.delete('/:taskId', isAuthenticated , async (req, res, next) => {
    const taskId = req.params.taskId;
    try {
       const deletedTask = await Task.findByIdAndDelete(taskId)
        res.status(200).json(deletedTask)
    } catch (error) {
        res.status(400).json({ message: `error deleting a task - ${error.message}`})
    }
})

module.exports = router;