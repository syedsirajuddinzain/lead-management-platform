const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { signToken } = require('../utils/jwt');

async function register({ name, email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({ name, email, password, role: role || 'member' });
  const token = signToken({ id: user._id, role: user.role });

  return { user, token };
}

async function login({ email, password }) {
  console.log("Email received:", email);
  console.log("Password received:", password);

  const user = await User.findOne({ email }).select("+password");

  console.log("User found:", !!user);

  if (!user) throw ApiError.unauthorized("Invalid email or password");

  console.log("Stored hash:", user.password);

  const isMatch = await user.comparePassword(password);

  console.log("Password match:", isMatch);

  if (!isMatch) throw ApiError.unauthorized("Invalid email or password");

  if (!user.isActive) throw ApiError.forbidden("Account has been deactivated");

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken({ id: user._id, role: user.role });
  user.password = undefined;

  return { user, token };
}
async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function updateProfile(userId, updates) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  if (updates.name) user.name = updates.name;
  if (updates.password) user.password = updates.password; // pre-save hook re-hashes

  await user.save();
  user.password = undefined;
  return user;
}

module.exports = { register, login, getProfile, updateProfile };
