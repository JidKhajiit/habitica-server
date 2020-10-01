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
        const { user: { _id } } = req
        const userGroups = await Group.find({ users: [ _id ] })

        res.status(200).send(userGroups);
    } catch (err) {
        console.log(err.message)
        res.status(500).json(err.message)
    }
})

router.post('/new-group', async (req, res) => {
    const { body: { title, desctiption, users, tasks } } = req;
    try {
        // const isUserExist = await User.findOne({ login });
        // if (isUserExist) throw new Error("User is already exist.");

        const newGroup = new Group({
            title,
            desctiption,
            users,
            tasks
        });
        newGroup.save();

        res.status(201).send(newGroup);
    } catch (err) {

        console.log(err.message)
        res.status(500).json(err.message)
    }
});


export default router