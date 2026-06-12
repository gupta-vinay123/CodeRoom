const mongoose = require('mongoose');

const snapshotSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  triggeredBy: { type: String, enum: ['cron', 'manual', 'execution'], default: 'cron' },
});


snapshotSchema.index({ roomId: 1, timestamp: 1 });

module.exports = mongoose.model('Snapshot', snapshotSchema);