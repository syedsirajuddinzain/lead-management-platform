const User = require('../models/User');
const Lead = require('../models/Lead');
const ApiError = require('../utils/ApiError');

async function listUsers({ page = 1, limit = 20, role, search }) {
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    items,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
  };
}

async function createUser({ name, email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists');
  return User.create({ name, email, password, role: role || 'member' });
}

async function updateUser(id, updates, requesterId) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');

  if (String(user._id) === String(requesterId) && updates.role && updates.role !== user.role) {
    throw ApiError.badRequest('You cannot change your own role');
  }

  if (updates.name !== undefined) user.name = updates.name;
  if (updates.role !== undefined) user.role = updates.role;
  if (updates.isActive !== undefined) user.isActive = updates.isActive;

  await user.save();
  return user;
}

async function deleteUser(id, requesterId) {
  if (String(id) === String(requesterId)) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');

  const assignedCount = await Lead.countDocuments({ assignedTo: id, isDeleted: { $ne: true } });
  if (assignedCount > 0) {
    throw ApiError.conflict(
      `Cannot delete user with ${assignedCount} assigned lead(s). Reassign their leads first.`
    );
  }

  await user.deleteOne();
  return true;
}

module.exports = { listUsers, createUser, updateUser, deleteUser };
