import Router from 'express';
import jwt from 'jsonwebtoken';
import User from '../schemes/user.js';
import Task from '../schemes/task.js';
import Group from '../schemes/group.js';
// import config from '../config/constants.js'

// const { secretOrKey } =  config;
const router = Router()


router.patch('/check/:id', async (req, res) => {
    try {
        const { params: { id: taskId }, body: { completed } } = req;
        await Task.updateOne({ _id: taskId }, { completed });


        res.status(200).send('edited');
    } catch (err) {
        console.log(err.message)
        res.status(500).json(err.message)
    }
})

router.patch('/:id', async (req, res) => {
    try {
        const { params: { id: taskId }, body } = req;

        const bodyParams = {
            title: '',
            description: '',
            workers: []
        }
        const bodyVerification = {...bodyParams, ...body};

        if(Object.keys(bodyParams).length >= Object.keys(bodyVerification).length) {
            await Task.updateOne({ _id: taskId }, { ...body });
        } else {
            throw new Error("Bad request.");
        }
        
        res.status(200).send('edited');
    } catch (err) {
        console.log(err.message)
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
    const { body: { title, description, workers, groupId } } = req;
    try {
        // const isUserExist = await User.findOne({ login });
        // if (isUserExist) throw new Error("User is already exist.");

        const newTask = new Task({
            title, description, workers, groupId, completed: false
        });
        await newTask.save();
        // if (groupId) {
        //     const currentGroup = await Group.findOne({ _id: groupId });
        //     let { tasks: tasksListInGroup } = currentGroup;
        //     tasksListInGroup.push(newTask._id);
        //     await Group.updateOne({ _id: groupId }, { tasks: tasksListInGroup })
        // }

        res.status(201).send(newTask);
    } catch (err) {

        console.log(err.message)
        res.status(500).json(err.message)
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { user: { _id: userId }, params: { id: taskId } } = req;
        const currentTask = await Task.findOne({ _id: taskId });
        const currentGroup = await Group.findOne({_id: currentTask.groupId});

        if(currentGroup.users.includes(userId)) {
            await Task.deleteOne({ _id: taskId });
        } else {
            throw new Error("This task isn't yours.");
        }
        
        res.status(204).send('deleted');
    } catch (err) {
        console.log(err.message)
        res.status(500).json(err.message)
    }
})

export default router