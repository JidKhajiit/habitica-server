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
        const nicks = users.map((user) => ({
            _id: user._id,
            nickName: user.nickName
        }))
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
        const { friends: myFriends } = await User.findOne({ _id: myUserId }).lean();
        const response = [];

        currentUsers && currentUsers.forEach(({ _id, nickName }) => {
            const userId = _id.toString()
            if (userId === myUserId.toString()) {
                console.log("it's me")
            } else if (myFriends.includes(userId)) {
                console.log('my friend')

            } else {
                const userInfo = { _id, nickName }
                userInfo.status = existedOutgoingReqs.find((req) => req.to.toString() === userId) ? 'outgoing req is exists' :
                    existedIncomingReqs.find((req) => req.out.toString() === userId) ? 'incoming req is exists' :
                        'not a friend';
                response.push(userInfo)
            }
        })
        res.status(200).send(response);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.get('/nicks/friends', async (req, res) => {
    try {
        const { user: { _id: myUserId } } = req;
        const myFriends = await User.find({ friends: myUserId }).lean();
        const response = myFriends.map(({ _id, nickName }) => ({ _id, nickName }));

        res.status(200).send(response);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

export default router