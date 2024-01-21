const UserModel = require('../models/user');

async function userExists(req, res, next) {
    try {
        req.userExists = false;
        const result = await UserModel.exists({ username: req.body.username });

        if (result)
            req.userExists = true;

        next();
    } catch (e) {
        res.status(500).send({ message: e.message });
        throw e;
    }
}

async function getUserById(req, res, next) {
    try {
        const user = await UserModel.findById(req.params.id || req.body.id || req.id);
        if (!user)
            return res.status(404).json({ message: 'user not found!' });

        req.user = user;
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    next();
}

async function getUserByUsername(req, res, next) {
    try {
        const result = await UserModel.find({ username: req.params.username || req.username });

        if (!result)
            return res.status(404).json({ message: 'user not found!' });

        req.user = result[0];
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    next();
}

module.exports = { userExists, getUserById, getUserByUsername };
