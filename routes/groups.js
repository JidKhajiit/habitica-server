import Router from 'express'
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../schemes/user.js'
import Task from '../schemes/task.js'
import Group from '../schemes/group.js'

const router = Router()


// router.get('/:id', async (req, res) => {
//     try {
//         const { params: { id } } = req;

//         const currentGroup = await Group.findOne({ _id: id });
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

router.get('/', async (req, res) => {
    try {
        const { user: { _id } } = req;
        const userGroups = await Group.find({ users: _id }).lean();
        const userGroupsWithCounter = [];
        for(const group of userGroups){
            const currentTasks = await Task.find({groupId: group._id}).lean()
            console.log(currentTasks)
            console.log("all", currentTasks.length)
            console.log("active", currentTasks.filter((task) => task.completed === false).length)
            group.tasks = {
                all: currentTasks.length,
                active: currentTasks.filter((task) => task.completed === false).length
            }
            userGroupsWithCounter.push(group)
        }
        res.status(200).send(userGroupsWithCounter);
    } catch (err) {
        console.log(err.message)
        res.status(500).json(err.message)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const { params: { id } } = req;
        const currentGroup = await Group.findOne({ _id: id }).lean();
        currentGroup.tasks = await Task.find({groupId: id});
        res.status(200).send(currentGroup);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.post('/new-group', async (req, res) => {
    const { body: { title, description, users, tags } } = req;
    try {
        const newGroup = new Group({
            title,
            description,
            users,
            tags
        });
        await newGroup.save();

        const { user: { _id } } = req;
        const userGroups = await Group.find({ users: _id }).lean();
        const userGroupsWithCounter = [];
        for(const group of userGroups){
            const currentTasks = await Task.find({groupId: group._id}).lean()
            group.tasks = {
                all: currentTasks.length,
                active: currentTasks.filter((task) => task.completed === false).length
            }
            userGroupsWithCounter.push(group)
        }


        res.status(201).send(userGroupsWithCounter);
    } catch (err) {

        console.log(err.message)
        res.status(500).json(err.message)
    }
});


export default router