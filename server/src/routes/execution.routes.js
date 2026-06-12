const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const executionQueue = require('../queues/executionQueue');

const SUPPORTED_LANGUAGES = ['javascript', 'python', 'cpp', 'java', 'go'];

router.post('/run', verifyToken, async (req, res) => {
  const { roomId, code, language, stdin = '' } = req.body;

  if (!code || code.length > 50000)
    return res.status(400).json({ message: 'Invalid code' });

  if (!roomId || !language)
    return res.status(400).json({ message: 'roomId and language required' });

  if (!SUPPORTED_LANGUAGES.includes(language))
    return res.status(400).json({ message: `Unsupported language: ${language}` });

  const job = await executionQueue.add('run-code', { roomId, code, language, stdin });

  res.json({ jobId: job.id, status: 'queued' });
});

module.exports = router;