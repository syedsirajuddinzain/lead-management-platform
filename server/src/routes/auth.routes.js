const express = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { loginSchema, registerSchema, updateProfileSchema } = require('../validations/auth.validation');

const router = express.Router();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, validate(updateProfileSchema), authController.updateMe);

module.exports = router;
