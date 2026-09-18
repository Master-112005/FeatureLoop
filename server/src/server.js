const mongoose = require('mongoose');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const app = require('./app');

async function main() {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`[server] API listening on http://localhost:${env.port}`);
    console.log(`[server] CORS origin: ${env.clientOrigin}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[server] ${signal} received — shutting down`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[server] failed to boot:', err);
  process.exit(1);
});