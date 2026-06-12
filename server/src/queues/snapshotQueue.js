const { Queue } = require('bullmq');
const bullmqConnection = require('../config/bullmqRedis');

const snapshotQueue = new Queue('snapshot-queue', {
  connection: bullmqConnection,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: 20,
    removeOnFail: 10,
  },
});

module.exports = snapshotQueue;