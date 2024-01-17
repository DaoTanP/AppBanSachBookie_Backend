const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// get config vars
dotenv.config();

// expires in 3600 seconds
function generateToken(username, expiresIn = 3600) {
    return jwt.sign({ username: username }, process.env.SERVER_TOKEN, { expiresIn: expiresIn });
}

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 401: invalid csrf token
    if (token == null)
        return res.sendStatus(401);

    jwt.verify(token, process.env.SERVER_TOKEN, (err, tokenData) => {

        if (err) {
            console.log(err.message);
            return res.sendStatus(403);
        }

        req.username = tokenData.username;
        next();
    });
}

module.exports = {
    generateToken,
    verifyToken
}