const User = require('../src/models/User');
const { signToken } = require('../src/utils/jwt');

async function createUser({ name = 'Test User', email, password = 'Passw0rd!', role = 'member' } = {}) {
  const user = await User.create({
    name,
    email: email || `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`,
    password,
    role,
  });
  const token = signToken({ id: user._id, role: user.role });
  return { user, token };
}

module.exports = { createUser };
