const { Worker } = require('bullmq');
const axios = require('axios');
const { getIO } = require('../socket/index');
const bullmqConnection = require('../config/bullmqRedis');
const snapshotQueue = require('../queues/snapshotQueue');

const LANGUAGE_MAP = {
  javascript: { language: 'nodejs', versionIndex: '4' },
  python: { language: 'python3', versionIndex: '4' },
  cpp: { language: 'cpp17', versionIndex: '1' },
  java: { language: 'java', versionIndex: '4' },
  go: { language: 'go', versionIndex: '4' },
};

const worker = new Worker('execution-queue', async (job) => {
  const { roomId, code, language, stdin } = job.data;

  const langConfig = LANGUAGE_MAP[language];
  if (!langConfig) throw new Error(`Unsupported language: ${language}`);

  const response = await axios.post('https://api.jdoodle.com/v1/execute', {
    script: code,
    language: langConfig.language,
    versionIndex: langConfig.versionIndex,
    stdin: stdin || '',
    clientId: process.env.JDOODLE_CLIENT_ID,
    clientSecret: process.env.JDOODLE_CLIENT_SECRET,
  }, { timeout: 15000 });

  const data = response.data;

  const payload = {
    stdout: data.output || '',
    stderr: '',
    status: data.statusCode === 200 ? 'Accepted' : 'Runtime Error',
    time: data.cpuTime || null,
    memory: data.memory || null,
  };

  getIO().to(roomId).emit('execution:result', payload);
  await snapshotQueue.add('snapshot', { roomId, triggeredBy: 'execution' });
  return payload;

}, {
  connection: bullmqConnection,
  stalledInterval: 60000,
  lockDuration: 60000,
  maxStalledCount: 3,
});

worker.on('failed', (job, err) => {
  console.error(`Execution job ${job.id} failed:`, err.message);
  try {
    getIO().to(job.data.roomId).emit('execution:error', { message: err.message });
  } catch {}
});

console.log('Execution worker started');
module.exports = worker;