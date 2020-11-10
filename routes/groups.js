import Router from 'express'
import Group from '../schemes/group.js'
import User from '../schemes/user.js'
import Task from '../schemes/task.js'
import mongoose from 'mongoose'

const router = Router()

Array.prototype.hasAllBesides = function (a) {
    return a.filter((item) => {
        if (!(this.includes(item))) {
            return true
        } else return false
    });
};

function unique(arr) {
    let result = [];

    for (let str of arr) {
        if (!result.includes(str)) {
            result.push(str);
        }
    }

    return result;
}

function uniqueUsers(arr) {
    const usersId = [];
    let result = [];

    for (let str of arr) {
        if (!usersId.includes(str.userId.toString())) {
            usersId.push(str.userId.toString())
            result.push(str);
        }
    }

    return result;
}


router.get('/', async (req, res) => {
    try {
        const { user: { _id } } = req;
        // await Group.update({ "users._id": { $exists: true } }, { $rename: { users: {_id: "userId" } } }, { multi: true });
        // await Group.updateMany( {}, { users: { userId: "5f75d278272f9c5301f394ab", $unset: {_id } } } )

        const myGroups = await Group.find({ "users.userId": _id }).populate('users.user').lean();
        // console.log("deep dark фэнтазис", myGroups[0].users);
        const myGroupsIds = myGroups.map((group) => group._id);

        const TasksOfAllMyGroups = await Task.find({ groupId: { $in: myGroupsIds } }).lean()
        const myGroupsWithCounter = myGroups.map((group) => {
            const currentTasks = TasksOfAllMyGroups.filter((task) => task.groupId === group._id.toString());
            group.tasks = {
                all: currentTasks.length,
                active: currentTasks.filter((task) => task.completed === false).length
            }
            return group
        })
        
        res.status(200).send(myGroupsWithCounter);
    } catch (err) {
        console.log(err.message)
        res.status(500).json(err.message)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const { params: { id } } = req;
        const currentGroup = await Group.findOne({ _id: id }).populate('users.user').lean();
        currentGroup.tasks = await Task.find({ groupId: id });
        currentGroup.users = currentGroup.users.map((user) => ({ userId: user.userId, nickName: user.user.nickName, role: user.role }));

        res.status(200).send(currentGroup);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { user: { _id: userId }, params: { id: groupId } } = req;
        const currentGroup = await Group.findOne({ _id: groupId });

        if (currentGroup.users.map(user => user.userId).includes(userId)) {
            await Group.deleteOne({ _id: groupId });
            await Task.deleteMany({ groupId });
        } else {
            throw new Error("This group isn't yours.");
        }

        res.status(204).send('deleted');
    } catch (err) {
        console.log(err.message)
        res.status(500).json(err.message)
    }
})

router.post('/new-group', async (req, res) => {
    const { body: { title, description, users, tags }, user: { _id } } = req;
    try {
        const newGroup = new Group({
            title,
            description,
            users: users.map(user => ({
                userId: mongoose.Types.ObjectId(user.userId),
                role: user.role || "new"
            })),
            tags: tags || []
        });
        await newGroup.save();

        res.status(201).send();
    } catch (err) {

        console.log(err.message)
        res.status(500).json(err.message)
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const { params: { id: groupId }, body } = req;
        console.log(groupId, body)
        const bodyParams = {
            title: '',
            tags: [],
            description: '',
            users: []
        }
        const bodyVerification = { ...bodyParams, ...body };

        if (Object.keys(bodyParams).length >= Object.keys(bodyVerification).length) { //ввести pull
            const currentGroup = await Group.findById(groupId);
            const expelledUsers = body.users.hasAllBesides(currentGroup.users);
            if (expelledUsers.length) {

                await Task.updateMany({ groupId: groupId }, { $pull: { workers: { _id: { $in: expelledUsers } } } })
            }
            await Group.updateOne({ _id: groupId }, { ...body });
        } else {
            throw new Error("Bad request.");
        }

        res.status(200).send('edited');
    } catch (err) {
        console.log(err.message)
        res.status(500).json(err.message)
    }
})

router.get('/:id/editing/users', async (req, res) => {
    try {
        const { params: { id }, user: { _id: myUserId } } = req;
        const currentGroup = await Group.findOne({ _id: id }).populate('users.user').lean();
        const myUser = await User.findOne({ _id: myUserId }).populate('friends').lean();
        const myFriends = myUser.friends.map(userInfo => ({user: userInfo}));
        // console.log(currentGroup.users, myFriends)
        const currentGroupUsers = currentGroup.users
        const currentUsers = [...currentGroupUsers, ...myFriends].map((item) => ({
            userId: item.user._id,
            nickName: item.user.nickName,
            role: item.role
        }));
        // console.log('where?', currentUsers)
        // const currentUsers = await User.find({ _id: { $in: currentUsersId } }).lean();
        const response = uniqueUsers(currentUsers)
        console.log('here.', response)
        res.status(200).send(response);
    } catch (err) {
        res.status(500).json(err.message)
    }
})


export default router