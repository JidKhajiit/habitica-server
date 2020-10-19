import Router from 'express';
import FriendReq from '../schemes/friendReq.js';
import User from '../schemes/user.js';

const router = Router()

router.post('/', async (req, res) => {
    try {
        const { user: { _id: myUserId }, body: { id: currentUserId } } = req;
        const isExists = await FriendReq.findOne({ out: myUserId, to: currentUserId })
        if (isExists) throw new Error("This bid for friendship is already exists.");

        const isReverseExists = await FriendReq.find({ out: currentUserId, to: myUserId })
        if (isReverseExists) { } //сразу связать (такой ситуации не должно произойти)
        const newBidForFriendship = new FriendReq({ out: myUserId, to: currentUserId });
        await newBidForFriendship.save();


        res.status(201).send(newBidForFriendship);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.delete('/delete/:id', async (req, res) => {
    try {
        const { user: { _id: myUserId }, params: { id: currentUserId } } = req;
        let currentBidForFriendship;
        currentBidForFriendship = await FriendReq.findOne({ out: { $in: [myUserId, currentUserId] }, to: { $in: [myUserId, currentUserId] } })
        if (!currentBidForFriendship) throw new Error("This request isn't exists.");

        await FriendReq.deleteOne(currentBidForFriendship)

        res.status(204).send('deleted');
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.get('/outgoing', async (req, res) => {
    try {
        const { user: { _id: myUserId } } = req;
        const myOutgoingBids = await FriendReq.find({ out: myUserId }).lean();
        const currentUsersIds = myOutgoingBids.map((bid) => bid.to);
        const currentUsers = await User.find({ _id: { $in: currentUsersIds } })
        const response = currentUsers.map(({_id, nickName}) => ({ _id, nickName }));

        res.status(201).send(response);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.get('/incoming', async (req, res) => {
    try {
        const { user: { _id: myUserId } } = req;
        const myIncomingBids = await FriendReq.find({ to: myUserId }).lean();
        const currentUsersIds = myIncomingBids.map((bid) => bid.out);
        const currentUsers = await User.find({ _id: { $in: currentUsersIds } })
        const response = currentUsers.map(({_id, nickName}) => ({ _id, nickName }));
        
        res.status(201).send(response);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.patch('/accept', async (req, res) => {
    try {
        const { user: { _id: myUserId }, body: { id: currentUserId } } = req;
        const currentIncomingBid = await FriendReq.find({ out: currentUserId, to: myUserId }).lean();
        if (currentIncomingBid) {
            await User.updateOne({ _id: myUserId }, { $addToSet: { friends: currentUserId } });
            await User.updateOne({ _id: currentUserId }, { $addToSet: { friends: myUserId } });
            await FriendReq.deleteOne({ out: currentUserId, to: myUserId })
        }
        res.status(201).send('edited');
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.patch('/del-friend', async (req, res) => {
    try {
        const { user: { _id: myUserId }, body: { id: currentUserId } } = req;
        console.log(myUserId, currentUserId)
        await User.updateOne({ _id: currentUserId }, { $pull: { friends: myUserId } });
        await User.updateOne({ _id: myUserId }, { $pull: { friends: currentUserId } });

        const newBidForFriendship = new FriendReq({
            out: currentUserId, to: myUserId
        });
        await newBidForFriendship.save();

        res.status(201).send('edited');
    } catch (err) {
        res.status(500).json(err.message)
    }
})

export default router