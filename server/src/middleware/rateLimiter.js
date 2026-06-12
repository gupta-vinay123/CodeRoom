const redis = require('../config/redis')

const rateLimiter = (max = 30, windowSec = 60) => async (req, res, next) => {
  const key = `ratelimit:${req.ip}:${req.path}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, windowSec)
  if (count > max) {
    return res.status(429).json({ message: 'Too many requests, slow down' })
  }
  next()
}

module.exports = rateLimiter