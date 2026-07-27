/* eslint-disable no-console */
const mongoose = require('mongoose');
const { mongoUri, seed } = require('../config/env');
const User = require('../models/User');

async function run() {
  await mongoose.connect(mongoUri);
  console.log('[seed] Connected to MongoDB');

  const existing = await User.findOne({ email: seed.adminEmail });
  if (existing) {
    console.log(`[seed] Admin user already exists: ${seed.adminEmail}`);
  } else {
    await User.create({
      name: 'Admin',
      email: seed.adminEmail,
      password: seed.adminPassword,
      role: 'admin',
    });
    console.log(`[seed] Admin user created: ${seed.adminEmail} / ${seed.adminPassword}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
