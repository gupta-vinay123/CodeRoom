const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const redis = require('../config/redis');

const generateTokens = (user) => {
  const access = jwt.sign({ id: user._id, role: user.role },process.env.JWT_SECRET,{ expiresIn: '15m' });
  const refresh = jwt.sign({ id: user._id },process.env.JWT_REFRESH_SECRET,{ expiresIn: '7d' });
  return { access, refresh };
};


exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already in use' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });
  const { access, refresh } = generateTokens(user);

  res.cookie('refreshToken', refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({ accessToken: access, user: { id: user._id, name: user.name, role: user.role } });
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const { access, refresh } = generateTokens(user);

  res.cookie('refreshToken', refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken: access, user: { id: user._id, name: user.name, role: user.role } });
};


exports.refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const { access, refresh } = generateTokens(user);

    res.cookie('refreshToken', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: access });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};


exports.logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    await redis.set(`blacklist:${token}`, '1', 'EX', 60 * 15);
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};