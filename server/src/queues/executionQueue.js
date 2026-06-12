const { Queue } = require('bullmq');
const bullmqConnection = require('../config/bullmqRedis');

const executionQueue = new Queue('execution-queue', {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 50,
    removeOnFail: 20,
  },
});

module.exports = executionQueue;