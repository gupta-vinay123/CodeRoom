const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  joinCode: { type: String, required: true, unique: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['waiting', 'active', 'ended'], default: 'waiting' },
  language: { type: String, default: 'javascript' },
  problemStatement: { type: String, default: '' },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  codeReview: { type: String, default: '' },
});

module.exports = mongoose.model('Room', roomSchema);