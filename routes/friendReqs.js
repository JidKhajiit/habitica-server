import Router from 'express';
import FriendReq from '../schemes/friendReq.js';
import User from '../schemes/user.js';

const router = Router()

router.post('/', async (req, res) => {
    try {
        const { user: { _id: myUserId }, body: { id: currentUserId } } = req;
        const isExists = await FriendReq.findOne({ out: myUserId, to: currentUserId })
        if (isExists) throw new Error("This request is already exists.");

        const isReverseExists = await FriendReq.find({ out: currentUserId, to: myUserId })
        if (isReverseExists) { } //сразу связать
        const newFriendReq = new FriendReq({
            out: myUserId, to: currentUserId
        });
        // console.log(newFriendReq);
        await newFriendReq.save();


        res.status(201).send(newFriendReq);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.delete('/delete/:id', async (req, res) => {
    try {
        const { user: { _id: myUserId }, params: { id: currentUserId } } = req;
        console.log(myUserId, currentUserId)
        let currentFriendReq;
        currentFriendReq = await FriendReq.findOne({ out: myUserId, to: currentUserId })
        if (!currentFriendReq) currentFriendReq = await FriendReq.findOne({ out: currentUserId, to: myUserId })
        if (!currentFriendReq) throw new Error("This request isn't exists.");

        await FriendReq.deleteOne(currentFriendReq)

        res.status(204).send('deleted');
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.get('/outgoing', async (req, res) => {
    try {
        const { user: { _id: myUserId } } = req;
        const myOutReqs = await FriendReq.find({ out: myUserId }).lean();
        const response = []
        for await (const req of myOutReqs) {
            const currentUser = await User.findById(req.to);
            // console.log(req.to, currentUser)
            response.push({
                _id: currentUser._id,
                nickName: currentUser.nickName
            })
        }
        res.status(201).send(response);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.get('/incoming', async (req, res) => {
    try {
        const { user: { _id: myUserId } } = req;
        const myIncomingReqs = await FriendReq.find({ to: myUserId }).lean();
        const response = []
        for await (const req of myIncomingReqs) {
            const currentUser = await User.findById(req.out);
            // console.log(req.to, currentUser)
            response.push({
                _id: currentUser._id,
                nickName: currentUser.nickName
            })
        }
        res.status(201).send(response);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.patch('/accept', async (req, res) => {
    try {
        const { user: { _id: myUserId }, body: { id: currentUserId } } = req;
        const currentIncomingReq = await FriendReq.find({ out: currentUserId, to: myUserId }).lean();
        if (currentIncomingReq) {
            await User.updateOne({ _id: myUserId }, { $push: { friends: currentUserId } });
            await User.updateOne({ _id: currentUserId }, { $push: { friends: myUserId } });
            await FriendReq.deleteOne({ out: currentUserId, to: myUserId })
        }
        res.status(201).send('edited');
    } catch (err) {
        res.status(500).json(err.message)
    }
})

export default router