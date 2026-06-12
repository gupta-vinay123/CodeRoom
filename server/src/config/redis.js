const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: { rejectUnauthorized: false },
  connectTimeout: 10000,
  keepAlive: 5000,
  enableOfflineQueue: true,
  retryStrategy: (times) => {
    if (times > 10) return null
    return Math.min(times * 300, 3000)
  },
  reconnectOnError: (err) => {
    return err.message.includes('ECONNRESET') || err.message.includes('ETIMEDOUT')
  }
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('ready', () => console.log('Redis ready'));
redis.on('close', () => console.warn('Redis connection closed'));
redis.on('reconnecting', () => console.warn('Redis reconnecting'));
redis.on('error', (err) => console.error('Redis error:', err.message));

module.exports = redis;