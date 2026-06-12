const required = [
  'MONGODB_URI',
  'REDIS_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
];

required.forEach((key) => {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
});