const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const { userExists } = require('../middlewares/userService');
const { verifyToken, generateToken } = require('../middlewares/auth');

router.post('/login', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        let query = {};
        if (username)
            query.username = new RegExp('^' + username + '$', 'i');
        if (password)
            query.password = new RegExp('^' + password + '$', 'i');

        if (Object.keys(query).length === 0)
            query = undefined;

        const result = await UserModel.findOne(query);
        if (result !== null) {
            const accessToken = generateToken(username);

            res.json({
                accessToken
            });
        }
        else
            res.status(404).send('User not found!');
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
});
router.post('/register', userExists, async (req, res) => {
    const user = new UserModel({
        username: req.body.username,
        password: req.body.password,
        displayName: 'user',
        role: req.body.role
    });
    try {
        const nUser = await user.save();
        nUser.displayName = 'user_' + nUser._id.toString();
        const newUser = await nUser.save();
        res.status(200).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
});

router.use(verifyToken);

router.route('/:id')
    .get(getUserById, (req, res) => {
        res.json(res.user);
    })
    .patch(getUserById, async (req, res) => {
        const user = res.user;
        const fieldsToUpdate = {};

        for (const key in user) {
            if (req.body.hasOwnProperty(key) && key !== '_id' && key !== 'username') {
                fieldsToUpdate[key] = req.body[key];
            }
        }

        try {
            const result = await user.updateOne(fieldsToUpdate);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    })
    .delete(getUserById, async (req, res) => {
        try {
            const user = res.user;
            await user.deleteOne();
            res.send("Deleted user with username: " + user.username);
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    });

async function getUserById(req, res, next) {
    let user;
    try {
        user = await UserModel.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: 'user not found!' });

        res.user = user;
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    next();
}

module.exports = router;