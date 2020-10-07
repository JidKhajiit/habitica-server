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
        let currentUsers = []; 

        for(const userId of currentGroup.users){
            const user = await User.findOne({_id: userId});
            currentUsers.push({
                _id: user._id,
                nickName: user.nickName
            });
        }
        currentGroup.users = currentUsers;
        res.status(200).send(currentGroup);
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { user: { _id: userId }, params: { id: groupId } } = req;
        const currentGroup = await Group.findOne({_id: groupId});

        if(currentGroup.users.includes(userId)) {
            await Group.deleteOne({ _id: groupId });
            await Task.deleteMany({groupId});
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

router.patch('/:id', async (req, res) => {
    try {
        const { params: { id: groupId }, body } = req;

        const bodyParams = {
            title: '',
            tags: [],
            description: '',
            users: []
        }
        const bodyVerification = {...bodyParams, ...body};

        if(Object.keys(bodyParams).length >= Object.keys(bodyVerification).length) {
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


export default router