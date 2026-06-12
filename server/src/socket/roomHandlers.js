const redis = require('../config/redis');
const Room = require('../models/Room.model');

module.exports = (io, socket) => {

  socket.on('room:join', async ({ roomId }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room || room.status === 'ended') {
        return socket.emit('room:error', { message: 'Room not found or ended' });
      }

      socket.join(roomId);
      socket.roomId = roomId;

      await redis.sadd(`room:${roomId}:users`, socket.user.id);

   
      const roomState = await redis.hgetall(`room:${roomId}`);

      socket.emit('room:joined', {
        roomId,
        code: roomState?.code || '',
        language: roomState?.language || room.language,
        problemStatement: roomState?.problemStatement || room.problemStatement, // FIX BUG 1
      });

      socket.to(roomId).emit('room:userJoined', {
        userId: socket.user.id,
        role: socket.user.role,
      });

      const activeUsers = await redis.smembers(`room:${roomId}:users`);
      io.to(roomId).emit('room:activeUsers', { users: activeUsers });

    } catch (err) {
      socket.emit('room:error', { message: err.message });
    }
  });

  
  socket.on('problem:set', async ({ roomId, problemStatement }) => {
    try {
      if (socket.user.role !== 'interviewer') return;

      await Room.findOneAndUpdate({ roomId }, { problemStatement });
      await redis.hset(`room:${roomId}`, 'problemStatement', problemStatement);

      // io.to instead of socket.to — sends to ALL including sender
      io.to(roomId).emit('problem:set', { problemStatement });
    } catch (err) {
      socket.emit('room:error', { message: err.message });
    }
  });

  socket.on('room:leave', async () => {
    await handleLeave(io, socket);
  });

  socket.on('disconnect', async () => {
    await handleLeave(io, socket);
  });
};

const handleLeave = async (io, socket) => {
  const roomId = socket.roomId;
  if (!roomId) return;

  await redis.srem(`room:${roomId}:users`, socket.user.id);
  socket.to(roomId).emit('room:userLeft', { userId: socket.user.id });

  const remaining = await redis.smembers(`room:${roomId}:users`);
  io.to(roomId).emit('room:activeUsers', { users: remaining });

  socket.leave(roomId);
};