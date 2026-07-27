const express = require('express');
const { z } = require('zod');
const leadController = require('../controllers/lead.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createLeadSchema,
  updateLeadSchema,
  updateStatusSchema,
  assignLeadSchema,
  addNoteSchema,
  STATUSES,
  PRIORITIES,
  SOURCES,
} = require('../validations/lead.validation');

const router = express.Router();

// Every route below requires a logged-in user
router.use(authenticate);

const listQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    status: z.enum(STATUSES).optional(),
    priority: z.enum(PRIORITIES).optional(),
    source: z.enum(SOURCES).optional(),
    assignedTo: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'status', 'priority']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

const idParamSchema = z.object({ params: z.object({ id: z.string() }) });

// Stats for dashboard - both roles (scoped to their own leads for members)
router.get('/stats', leadController.getDashboardStats);

// List + read - both roles (service layer scopes members to their assigned leads)
router.get('/', validate(listQuerySchema), leadController.listLeads);
router.get('/:id', validate(idParamSchema), leadController.getLead);

// Create - admin only
router.post('/', authorize('admin'), validate(createLeadSchema), leadController.createLead);

// Full edit - admin only
router.patch('/:id', authorize('admin'), validate(updateLeadSchema), leadController.updateLead);

// Status update - both roles (service layer restricts members to their own leads)
router.patch('/:id/status', validate(updateStatusSchema), leadController.updateStatus);

// Assignment - admin only
router.patch('/:id/assign', authorize('admin'), validate(assignLeadSchema), leadController.assignLead);

// Notes - both roles (service layer restricts members to their own leads)
router.post('/:id/notes', validate(addNoteSchema), leadController.addNote);

// Delete - admin only
router.delete('/:id', authorize('admin'), leadController.deleteLead);

module.exports = router;
