const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const aiQueue = require('../queues/aiQueue');
const redis = require('../config/redis');

const HINT_LIMIT = 3;

router.post('/hint', verifyToken, async (req, res) => {
  const { roomId, code, problem } = req.body;
  if (!roomId || !code) return res.status(400).json({ message: 'roomId and code required' });

  const countKey = `room:${roomId}:hintCount`;
  const count = await redis.incr(countKey);

  if (count === 1) {
    await redis.expire(countKey, 2 * 60 * 60);
  }

  if (count > HINT_LIMIT) {
    return res.status(429).json({ message: `Hint limit reached (${HINT_LIMIT} per session)` });
  }

  await aiQueue.add('ai-job', {
    type: 'hint',
    roomId,
    code,
    problem,
    targetUserId: req.user.id,
  });

  res.json({ status: 'queued', hintsUsed: count, hintsRemaining: HINT_LIMIT - count });
});


router.post('/review', verifyToken, async (req, res) => {
  const { roomId, code, language } = req.body;
  if (!roomId || !code) return res.status(400).json({ message: 'roomId and code required' });

  await aiQueue.add('ai-job', {
    type: 'review',
    roomId,
    code,
    language,
    targetUserId: req.user.id,
  });

  res.json({ status: 'queued' });
});


router.post('/explain', verifyToken, async (req, res) => {
  const { roomId, code } = req.body;
  if (!roomId || !code) return res.status(400).json({ message: 'roomId and code required' });

  await aiQueue.add('ai-job', {
    type: 'explain',
    roomId,
    code,
    targetUserId: req.user.id,
  });

  res.json({ status: 'queued' });
});


router.post('/followup', verifyToken, async (req, res) => {
  const { roomId, code, problem } = req.body;
  if (!roomId || !code) return res.status(400).json({ message: 'roomId and code required' });
  if (req.user.role !== 'interviewer')
    return res.status(403).json({ message: 'Interviewers only' });

  await aiQueue.add('ai-job', {
    type: 'followup',
    roomId,
    code,
    problem,
    targetUserId: req.user.id,
  });

  res.json({ status: 'queued' });
});

module.exports = router;