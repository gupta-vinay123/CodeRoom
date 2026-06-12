const Message = require('../models/Message.model');

module.exports = (io, socket) => {

  socket.on('chat:message', async ({ roomId, text }) => {
    if (!text?.trim()) return;

    const message = await Message.create({
      roomId,
      senderId: socket.user.id,
      text: text.trim(),
      type: 'user',
    });

    io.to(roomId).emit('chat:message', {
      _id: message._id,
      senderId: socket.user.id,
      text: message.text,
      createdAt: message.createdAt,
      type: 'user',
    });
  });

  socket.on('chat:typing', ({ roomId }) => {
    socket.to(roomId).emit('chat:typing', { userId: socket.user.id });
  });
};