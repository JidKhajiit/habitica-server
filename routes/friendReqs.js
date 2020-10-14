import Router from 'express';
import friendReq from '../schemes/friendReq.js';
import User from '../schemes/user.js';

const router = Router()

router.post('/add', async (req, res) => {
    try {
        const { user: { _id: myUserId }, body: { id: currentUserId } } = req;
        console.log('hiiiiiiiiiiii')
        const isExists = await friendReq.findOne({ out: myUserId, in: currentUserId })
        if (isExists) throw new Error("This request is already exists.");
        
        const isReverseExists = await friendReq.find({ out: currentUserId, in: myUserId })
        if (isReverseExists) { } //сразу связать
        const newFriendReq = new friendReq({
            out: myUserId, in: currentUserId
        });
        console.log(newFriendReq);
        await newFriendReq.save();


        res.status(201).send(newFriendReq);
    } catch (err) {
        res.status(500).json(err.message)
    }
})


export default router