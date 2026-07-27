const mongoose = require('mongoose');
const { mongoUri, env } = require('./env');

mongoose.set('strictQuery', true);

async function connectDB() {
  if (env === 'test') return; // tests manage their own connection (mongodb-memory-server)

  try {
    await mongoose.connect(mongoUri);

console.log("Connected DB:", mongoose.connection.name);
console.log("Connection String:", mongoUri);
    // eslint-disable-next-line no-console
    console.log(`[db] MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[db] MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  if (env !== 'test') console.warn('[db] MongoDB disconnected');
});

module.exports = connectDB;
