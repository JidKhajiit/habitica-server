import Router from 'express'
import User from '../schemes/user.js'
import Task from '../schemes/task.js'
import Group from '../schemes/group.js'
import group from '../schemes/group.js';

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



router.get('/', async (req, res) => {
    try {
        const { user: { _id } } = req;
        const myGroups = await Group.find({ users: _id }).lean();
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
        const currentGroup = await Group.findOne({ _id: id }).lean();
        currentGroup.tasks = await Task.find({ groupId: id });
        const currentUsers = await User.find({ _id: { $in: currentGroup.users } }).lean();
        currentUsers.map((user) => ({ _id: user._id, nickName: user.nickName }))
        currentGroup.users = currentUsers;

        res.status(200).send(currentGroup);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { user: { _id: userId }, params: { id: groupId } } = req;
        const currentGroup = await Group.findOne({ _id: groupId });

        if (currentGroup.users.includes(userId)) {
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
            users,
            tags
        });
        await newGroup.save();

        const myGroups = await Group.find({ users: _id }).lean();
        const myGroupsIds = myGroups.map((group) => group._id);
        const TasksOfAllMyGroups = await Task.find({ groupId: { $in: myGroupsIds } }).lean()
        const myGroupsWithCounter = myGroups.map((group) => {
            const currentTasks = TasksOfAllMyGroups.filter((task) => task.groupId === group._id.toString());
            group.tasks = {
                all: currentTasks.length,
                active: currentTasks.filter((task) => task.completed === false).length
            }
            return group
        });

        res.status(201).send(myGroupsWithCounter);
    } catch (err) {

        console.log(err.message)
        res.status(500).json(err.message)
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const { params: { id: groupId }, body } = req;

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
        const currentGroup = await Group.findOne({ _id: id }).lean();
        const myUser = await User.findOne({ _id: myUserId }).lean();
        const myFriends = myUser.friends;

        const currentUsersId = unique([...currentGroup.users, ...myFriends]);

        const currentUsers = await User.find({ _id: { $in: currentUsersId } }).lean();
        const response = currentUsers.map((user) => ({
            _id: user._id,
            nickName: user.nickName
        }))

        res.status(200).send(response);
    } catch (err) {
        res.status(500).json(err.message)
    }
})


export default router