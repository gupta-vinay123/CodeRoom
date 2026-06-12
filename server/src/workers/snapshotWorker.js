const { Worker } = require('bullmq');
const redis = require('../config/redis');
const Snapshot = require('../models/Snapshot.model');
const bullmqConnection = require('../config/bullmqRedis');

const worker = new Worker('snapshot-queue', async (job) => {
  const { roomId, triggeredBy = 'cron' } = job.data;
  const roomState = await redis.hgetall(`room:${roomId}`);

  if (!roomState || !roomState.code) {
    console.log(`Snapshot skipped for ${roomId} — no code yet`);
    return;
  }

  
  const lastSnapshotCode = await redis.get(`room:${roomId}:lastSnapshot`);
  if (lastSnapshotCode === roomState.code) {
    console.log(`Snapshot skipped for ${roomId} — no change`);
    return;
  }

  await Snapshot.create({
    roomId,
    code: roomState.code,
    language: roomState.language || 'javascript',
    triggeredBy,
  });


  await redis.set(`room:${roomId}:lastSnapshot`, roomState.code, 'EX', 2 * 60 * 60);

  console.log(`Snapshot saved for room ${roomId}`);
}, { connection: bullmqConnection });

worker.on('failed', (job, err) => {
  console.error(`Snapshot job ${job.id} failed:`, err.message);
});

console.log('Snapshot worker started');
module.exports = worker;