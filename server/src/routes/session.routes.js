const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const Snapshot = require('../models/Snapshot.model');
const Room = require('../models/Room.model');

const interviewerOnly = (req, res, next) => {
  if (req.user.role !== 'interviewer')
    return res.status(403).json({ message: 'Interviewers only' });
  next();
};

// Only interviewer can view replay snapshots
router.get('/:roomId/snapshots', verifyToken, interviewerOnly, async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findOne({ roomId, participantIds: req.user.id });
  if (!room) return res.status(403).json({ message: 'Access denied' });

  const snapshots = await Snapshot.find({ roomId })
    .sort({ timestamp: 1 })
    .select('code language timestamp triggeredBy');

  res.json({ roomId, total: snapshots.length, snapshots });
});

router.post('/:roomId/snapshot', verifyToken, async (req, res) => {
  const { roomId } = req.params;
  const snapshotQueue = require('../queues/snapshotQueue');
  await snapshotQueue.add('snapshot', { roomId, triggeredBy: 'manual' });
  res.json({ status: 'queued' });
});

module.exports = router;
