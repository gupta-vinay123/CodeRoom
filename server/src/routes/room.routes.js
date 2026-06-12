const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const {
  createRoom, joinRoom, getRoomById,
  extendRoom, endRoom, getMyRooms
} = require('../controllers/room.controller');

const interviewerOnly = (req, res, next) => {
  if (req.user.role !== 'interviewer')
    return res.status(403).json({ message: 'Interviewers only' });
  next();
};

router.use(verifyToken);

router.post('/create', createRoom);
router.post('/join', joinRoom);
router.get('/my', getMyRooms);
router.get('/:roomId', getRoomById);
router.patch('/:roomId/extend', extendRoom);
router.patch('/:roomId/end', interviewerOnly, endRoom);

module.exports = router;
