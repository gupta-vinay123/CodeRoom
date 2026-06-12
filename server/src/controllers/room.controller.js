const { v4: uuidv4 } = require('uuid');
const Room = require('../models/Room.model');
const redis = require('../config/redis');


const generateJoinCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

exports.createRoom = async (req, res) => {
  const { language = 'javascript' } = req.body;

  const roomId = uuidv4();
  const joinCode = generateJoinCode();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); 

  const room = await Room.create({
    roomId,
    joinCode,
    creatorId: req.user.id,
    participantIds: [req.user.id],
    language,
    expiresAt,
  });


  await redis.hset(`room:${roomId}`, {
    status: 'waiting',
    language,
    creatorId: req.user.id,
    code: '',
  });
  await redis.expireat(`room:${roomId}`, Math.floor(expiresAt.getTime() / 1000));

  res.status(201).json({ roomId, joinCode, expiresAt });
};


exports.joinRoom = async (req, res) => {
  const { joinCode } = req.body;

  const room = await Room.findOne({ joinCode });
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (room.status === 'ended') return res.status(410).json({ message: 'Room has ended' });
  if (room.participantIds.length >= 2 && !room.participantIds.map(String).includes(req.user.id))
    return res.status(403).json({ message: 'Room is full' });


  if (!room.participantIds.map(String).includes(req.user.id)) {
    room.participantIds.push(req.user.id);
    room.status = 'active';
    await room.save();
  }

  const roomState = await redis.hgetall(`room:${room.roomId}`);

  res.json({
    roomId: room.roomId,
    language: room.language,
    status: room.status,
    code: roomState?.code || '',
    problemStatement: room.problemStatement,
  });
};

exports.getRoomById = async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findOne({ roomId }).populate('creatorId', 'name');
  if (!room) return res.status(404).json({ message: 'Room not found' });
  res.json(room);
};

exports.extendRoom = async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findOne({ roomId });
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (String(room.creatorId) !== req.user.id)
    return res.status(403).json({ message: 'Only creator can extend' });

  room.expiresAt = new Date(room.expiresAt.getTime() + 30 * 60 * 1000); 
  await room.save();
  await redis.expireat(`room:${roomId}`, Math.floor(room.expiresAt.getTime() / 1000));

  res.json({ expiresAt: room.expiresAt });
};

exports.endRoom = async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findOne({ roomId });
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (String(room.creatorId) !== req.user.id)
    return res.status(403).json({ message: 'Only creator can end room' });

  room.status = 'ended';
  await room.save();
  await redis.hset(`room:${roomId}`, 'status', 'ended');

  // Notify all participants so candidate gets redirected
  const { getIO } = require('../socket/index');
  getIO().to(roomId).emit('room:ended', { message: 'Session ended by interviewer' });

  res.json({ message: 'Room ended' });
};

exports.getMyRooms = async (req, res) => {
  const rooms = await Room.find({ participantIds: req.user.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('roomId joinCode status language createdAt expiresAt participantIds');
  res.json(rooms);
};