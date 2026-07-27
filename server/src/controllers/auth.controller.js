const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  new ApiResponse(200, { user, token }, 'Logged in successfully').send(res);
});

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  new ApiResponse(201, { user, token }, 'Account created successfully').send(res);
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  new ApiResponse(200, { user }).send(res);
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  new ApiResponse(200, { user }, 'Profile updated successfully').send(res);
});

module.exports = { login, register, getMe, updateMe };
