import Router from 'express'
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../schemes/user.js'
import config from '../config/constants.js'

const { secretOrKey } =  config;
const router = Router()


// router.get('/:id', async (req, res) => {
//     try {
//         const { params: { id } } = req;

//         const currentUser = await User.findOne({_id: id});
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

router.get('/verify', passport.authenticate('jwt', { session:false }), async (req, res) => {
    try {
        const { headers: { authorization } } = req;
        res.status(200).send(authorization);
        
    } catch (err) {
        res.status(500).json(err.message)
    }
})

router.post('/signup', async (req, res) => {
    const { body: { login, nickName, password, firstName, lastName } } = req;
    try {
        const isUserExist = await User.findOne({ login });

        if (isUserExist) throw new Error("User is already exist.");

        const user = new User({
            login,
            nickName: login,
            password,
            firstName,
            lastName
        });
        console.log(user);
        user.save();
        const token = `Bearer ${jwt.sign({
            _id: user._id,
            nickName
        }, secretOrKey, {expiresIn: 86400 * 30})}`;
        res.status(201).send(token);
    } catch (err) {

        console.log(err.message)
        res.status(500).json(err.message)
    }
});

router.post('/signin', async (req, res) => {
    const { body: { login, password } } = req;

    try {
        const isUserExist = await User.findOne({ login });
        // console.log(isUserExist)
        if (!isUserExist) {
            throw new Error("User isn't exist.")
        } else if (isUserExist.password !== password) {
            throw new Error("Wrong password. Ur mom will die!!!")
        } else {
            const { _id, nickName, firstName, lastName } = isUserExist
            const token = `Bearer ${jwt.sign({
                _id,
                nickName
            }, secretOrKey, {expiresIn: 86400 * 30})}`;
            res.status(200).send(token)
        }

    } catch (err) {
        // console.log(err.message)
        if (err.message == "User isn't exist.") {
            res.status(400).json(err.message)
        } else if (err.message == "Wrong password. Ur mom will die!!!") {
            res.status(401).json(err.message)
        } else {
            res.status(500).json(err.message)
        }
        
    }
})


export default router