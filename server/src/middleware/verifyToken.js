const jwt = require('jsonwebtoken');
const redis = require('../config/redis');

const verifyToken = async (req, res, next) => {
    
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];

  const blacklisted = await redis.get(`blacklist:${token}`);
  if (blacklisted)
    return res.status(401).json({ message: 'Token invalidated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;