const getBullmqConnection = () => {
  const redisUrl = new URL(process.env.REDIS_URL)
  return {
    host: redisUrl.hostname,
    port: parseInt(redisUrl.port),
    password: redisUrl.password,
    username: redisUrl.username || 'default',
    tls: { rejectUnauthorized: false },
    keepAlive: 5000,
    connectTimeout: 10000,
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    retryStrategy: (times) => {
        if (times > 10) return null
        return Math.min(times * 300, 3000)
    },
  }
}

module.exports = getBullmqConnection()