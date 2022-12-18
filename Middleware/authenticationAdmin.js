const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateAdmin(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(user.user['admin'] == 1) {
            if (err) {
                return res.sendStatus(401)
            }
            req.user = user;
            next();
        } else {
            res.status(401).json({
                message: "You are not an admin",
            });
        }
    });
}

module.exports = authenticateAdmin;