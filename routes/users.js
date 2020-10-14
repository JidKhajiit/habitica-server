import Router from 'express';
import jwt from 'jsonwebtoken';
import User from '../schemes/user.js';
import Task from '../schemes/task.js';
import Group from '../schemes/group.js';
import friendReq from '../schemes/friendReq.js';
// import config from '../config/constants.js'

// const { secretOrKey } =  config;
const router = Router()


router.get('/', async (req, res) => {
    try {
        const { params: { id } } = req;
        const users = await User.find().lean()
        res.status(200).send(currentUsers);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.get('/nicks', async (req, res) => {
    try {
        const users = await User.find().lean();
        const nicks = [];
        users.forEach((user) => {
            nicks.push({
                _id: user._id,
                nickName: user.nickName
            })
        })
        res.status(200).send(nicks);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

// router.get('/nicks/:part', async (req, res) => {
//     try {

//         const { params: { part } } = req;
//         const users = await User.find({ nickName: new RegExp(part) });
//         const nicks = [];
//         users.forEach((user) => {
//             nicks.push({
//                 _id: user._id,
//                 nickName: user.nickName
//             })
//         })
//         res.status(200).send(nicks);
//     } catch (err) {
//         res.status(500).json(err.message)
//     }
// })

router.get('/nicks/add-friend/:part', async (req, res) => {
    try {

        const { params: { part }, user: { _id: myUserId } } = req;
        const currentUsers = await User.find({ nickName: new RegExp(part) }).lean();
        const existedReqs = await friendReq.find({ out: myUserId })
        const myUser = await User.findOne({ _id: myUserId }).lean();
        const myFriends = myUser.friends
        const nicks = [];
        console.log(existedReqs)


        currentUsers.forEach((user) => {
            const userId = user._id.toString()
            console.log(userId)
            if (userId === myUserId.toString()) {
                console.log("it's me")
            } else if (myFriends.includes(userId)) {
                console.log('my friend')

            } else if (existedReqs.find((req) =>  req.in.toString() === userId )) {
                console.log('exists')
                nicks.push({
                    _id: user._id,
                    nickName: user.nickName,
                    status: 'req is exists'
                })
            } else {
                nicks.push({
                    _id: user._id,
                    nickName: user.nickName,
                    status: 'not a friend'
                })
            }

        })
        res.status(200).send(nicks);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.post('/new-task', async (req, res) => {
    const { body: { title, description, workers, groupId, completed } } = req;
    try {
        // const isUserExist = await User.findOne({ login });
        // if (isUserExist) throw new Error("User is already exist.");

        const newTask = new Task({
            title, description, workers, groupId, completed
        });
        console.log(newTask);
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

export default router