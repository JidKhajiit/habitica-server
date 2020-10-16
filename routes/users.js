import Router from 'express';
import jwt from 'jsonwebtoken';
import User from '../schemes/user.js';
import Task from '../schemes/task.js';
import Group from '../schemes/group.js';
import FriendReq from '../schemes/friendReq.js';
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
        const existedOutgoingReqs = await FriendReq.find({ out: myUserId });
        const existedIncomingReqs = await FriendReq.find({ to: myUserId });
        const myUser = await User.findOne({ _id: myUserId }).lean();
        const myFriends = myUser.friends
        const nicks = [];

        currentUsers && currentUsers.forEach((user) => {
            const userId = user._id.toString()
            // console.log('user', userId)
            if (userId === myUserId.toString()) {
                console.log("it's me")
            } else if (myFriends.includes(userId)) {
                console.log('my friend')

            } else if (existedOutgoingReqs.find((req) => req.to.toString() === userId)) {
                console.log('exists')
                nicks.push({
                    _id: user._id,
                    nickName: user.nickName,
                    status: 'outgoing req is exists'
                })
            } else if (existedIncomingReqs.find((req) => req.out.toString() === userId)) {
                nicks.push({
                    _id: user._id,
                    nickName: user.nickName,
                    status: 'incoming req is exists'
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

router.get('/nicks/friends', async (req, res) => {
    try {
       
        const { user: { _id: myUserId } } = req;
        const myFriends = await User.find({ friends: myUserId }).lean();
        const response = myFriends.map((user) => ({
            _id: user._id,
            nickName: user.nickName,
        }));

        res.status(200).send(response);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

export default router