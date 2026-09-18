const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  console.log(`[db] connected: ${env.mongoUri}`);
  return mongoose.connection;
}

module.exports = { connectDB };