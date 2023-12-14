const UserModel = require('../models/user');

async function userExists(req, res, next) {
    try {
        const result = await UserModel.exists({ username: req.body.username });

        if (result)
            res.status(400).json({ message: 'User already exists' });

        next();
    } catch (e) {
        res.status(500).send({ message: e.message });
        throw e;
    }
}

module.exports = { userExists };