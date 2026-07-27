const express = require('express');
const { z } = require('zod');
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { registerSchema } = require('../validations/auth.validation');

const router = express.Router();

// All routes below require authentication + admin role
router.use(authenticate, authorize('admin'));

const createUserSchema = z.object({
  body: registerSchema.shape.body.extend({
    role: z.enum(['admin', 'member']).optional(),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    role: z.enum(['admin', 'member']).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({ id: z.string() }),
});

const listUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    role: z.enum(['admin', 'member']).optional(),
    search: z.string().optional(),
  }),
});

router.get('/', validate(listUsersQuerySchema), userController.listUsers);
router.post('/', validate(createUserSchema), userController.createUser);
router.patch('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
