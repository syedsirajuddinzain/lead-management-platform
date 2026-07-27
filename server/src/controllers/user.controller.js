const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');

const listUsers = asyncHandler(async (req, res) => {
  const { items, meta } = await userService.listUsers(req.validatedQuery || req.query);
  new ApiResponse(200, items, 'Users fetched successfully', meta).send(res);
});

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  new ApiResponse(201, { user }, 'User created successfully').send(res);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user._id);
  new ApiResponse(200, { user }, 'User updated successfully').send(res);
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user._id);
  new ApiResponse(200, null, 'User deleted successfully').send(res);
});

module.exports = { listUsers, createUser, updateUser, deleteUser };
