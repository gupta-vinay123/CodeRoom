require('dotenv').config();
require('./config/env');
require('./config/redis');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const http = require('http');
const { initSocket } = require('./socket/index');
const startSnapshotCron = require('./workers/snapshotCron');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', rateLimiter(10, 60));
app.use('/api/execution', rateLimiter(20, 60));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/rooms', require('./routes/room.routes'));
app.use('/api/execution', require('./routes/execution.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/sessions', require('./routes/session.routes'));

app.use(require('./middleware/errorHandler'));

connectDB().then(() => {
 
  require('./workers/executionWorker');
  require('./workers/aiWorker');
  require('./workers/snapshotWorker');

  const server = http.createServer(app);
  initSocket(server);
  startSnapshotCron();
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

module.exports = app;