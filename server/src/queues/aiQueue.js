const { Queue } = require('bullmq');
const bullmqConnection = require('../config/bullmqRedis');

const aiQueue = new Queue('ai-queue', {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 30,
    removeOnFail: 10,
  },
});

module.exports = aiQueue;