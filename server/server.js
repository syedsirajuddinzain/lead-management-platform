const app = require('./src/app');
const connectDB = require('./src/config/db');
const { port } = require('./src/config/env');

async function start() {
  await connectDB();

  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Listening on port ${port}`);
  });

  process.on('unhandledRejection', (err) => {
    // eslint-disable-next-line no-console
    console.error('[unhandledRejection]', err);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    // eslint-disable-next-line no-console
    console.log('[server] SIGTERM received, shutting down gracefully');
    server.close(() => process.exit(0));
  });
}

start();
