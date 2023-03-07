const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    let token;
    try {
        token = req.header('Authorization').split(' ')[1];
    } catch (err) {
        return res.status(401).json({
            message: "No token, authorization denied",
        })
    }
    
    try {
        const decoded = jwt.verify(token, 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "token is not valid",
        })   
    }

}

module.exports = { auth };
