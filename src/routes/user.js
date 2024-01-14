const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const { userExists, getUserById, getUserByUsername } = require('../middlewares/userService');
const { verifyToken, generateToken } = require('../middlewares/auth');
const { uploadImages, setStorageDirectory, setFileName } = require('../middlewares/fileService');

setStorageDirectory('./public/images/user');

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

            // fileService => khi user upload anh avatar, dat ten file la id cua user
            setFileName(result._id.toString());
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
        displayName: req.body.displayName || undefined,
        role: req.body.role
    });
    try {
        const nUser = await user.save();
        if (!nUser.displayName)
            nUser.displayName = 'user_' + nUser._id.toString();
        const newUser = await nUser.save();

        const accessToken = generateToken(newUser.username);
        res.json({
            accessToken
        });

        // fileService => khi user upload anh avatar, dat ten file la id cua user
        setFileName(newUser._id.toString());
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/usernameAvailable', userExists, async (req, res) => {
    res.status(200).json({ message: 'Username ' + req.body.username + 'is available' });
});

router.use(verifyToken);

router.route('/')
    .get(getUserByUsername, (req, res) => {
        req.user.avatar = req.protocol + "://" + req.hostname + ':3000/public/images/user/' + req.user.avatar;
        req.password = '';
        res.json(req.user);
    })
    .patch(getUserByUsername, uploadImages.single('file'), async (req, res) => {
        const user = req.user;

        const fieldsToUpdate = req.body;

        if (req.file) {
            // const filePath = req.protocol + "://" + req.hostname + ':3000/public/' + req.file.filename;
            // fieldsToUpdate.avatar = filePath;
            fieldsToUpdate.avatar = req.file.filename;
        }

        try {
            const result = await user.updateOne(fieldsToUpdate);

            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    })
    .delete(getUserByUsername, async (req, res) => {
        try {
            const user = req.user;
            await user.deleteOne();
            res.send("Deleted user with username: " + user.username);
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    });

router.route('/:id')
    .get(getUserById, (req, res) => {
        res.json(req.user);
    })
    .delete(getUserById, async (req, res) => {
        try {
            const user = req.user;
            await user.deleteOne();
            res.send("Deleted user with username: " + user.username);
        } catch (error) {
            res.status(400).json({ message: error.message })
        }
    });

module.exports = router;