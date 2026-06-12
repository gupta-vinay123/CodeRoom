const redis = require('../config/redis');

module.exports = (io, socket) => {

  socket.on('editor:change', async ({ roomId, code }) => {
    
    await redis.hset(`room:${roomId}`, 'code', code);

    socket.to(roomId).emit('editor:change', { code });
  });

  socket.on('cursor:move', ({ roomId, position, color }) => {
    socket.to(roomId).emit('cursor:move', {
      userId: socket.user.id,
      position,
      color,
    });
  });

  socket.on('language:change', async ({ roomId, language }) => {
    await redis.hset(`room:${roomId}`, 'language', language);
    io.to(roomId).emit('language:change', { language });
  });
};