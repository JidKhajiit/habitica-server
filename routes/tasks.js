import Router from 'express';
import jwt from 'jsonwebtoken';
import User from '../schemes/user.js';
import Task from '../schemes/task.js';
import Group from '../schemes/group.js';
// import config from '../config/constants.js'

// const { secretOrKey } =  config;
const router = Router()


// router.get('/:id', async (req, res) => {
//     try {
//         const { params: { id } } = req;

//         const currentTask = await Task.findOne({_id: id});
//         const { firstName, lastName } = currentUser;
//         const response = {
//             firstName,
//             lastName
//         }
//         res.status(200).send(response);
//     } catch (err) {
//         console.log(err.message)
//         res.status(500).json(err.message)
//     }
// })

router.get('/group/:id', async (req, res) => {
    try {
        const { params: { id } } = req;
        const currentGroup = await Group.find({ _id: id });
        const { tasks: currentTasksId } = currentGroup;
        const currentTasks = currentTasksId.map((_id) => Task.findOne({ _id }))
        res.status(200).send(currentTasks);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.get('/user/:id', async (req, res) => {
    try {
        const { params: { id } } = req;
        const currentTasks = await Task.find({ "workers.id": id })
        res.status(200).send(currentTasks);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.post('/new-task', async (req, res) => {
    const { body: { title, description, workers } } = req;
    try {
        // const isUserExist = await User.findOne({ login });
        // if (isUserExist) throw new Error("User is already exist.");

        const newTask = new Task({
            title, description, workers
        });
        console.log(newTask);
        newTask.save();
        res.status(201).send(newTask);
    } catch (err) {

        console.log(err.message)
        res.status(500).json(err.message)
    }
});

export default router