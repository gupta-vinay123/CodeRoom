const redis = require('../config/redis');
const snapshotQueue = require('../queues/snapshotQueue');

const startSnapshotCron = async () => {
  setInterval(async () => {
    try {
      const keys = await redis.keys('room:*:users');

      for (const key of keys) {
        const roomId = key.split(':')[1];
        const activeUsers = await redis.smembers(`room:${roomId}:users`);

       
        if (activeUsers.length > 0) {
          await snapshotQueue.add('snapshot', { roomId, triggeredBy: 'cron' });
        }
      }
    } catch (err) {
      console.error('Snapshot cron error:', err.message);
    }
  }, 60 * 1000); 

  console.log('Snapshot cron started');
};

module.exports = startSnapshotCron;