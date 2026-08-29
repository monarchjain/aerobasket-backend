const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Authorization failed: no token provided');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' from the beginning

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Authorization failed: invalid token');
        return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
};

module.exports = protect;