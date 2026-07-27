const { z } = require('zod');

const STATUSES = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const SOURCES = ['Website', 'Referral', 'LinkedIn', 'Other'];

const createLeadSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Invalid email address'),
    phone: z
      .string()
      .trim()
      .regex(/^[+]?[\d\s()-]{7,20}$/, 'Invalid phone number'),
    company: z.string().trim().max(150).optional().default(''),
    message: z.string().trim().max(2000).optional().default(''),
    priority: z.enum(PRIORITIES).optional(),
    source: z.enum(SOURCES).optional(),
  }),
});

const updateLeadSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(100).optional(),
      email: z.string().trim().email().optional(),
      phone: z
        .string()
        .trim()
        .regex(/^[+]?[\d\s()-]{7,20}$/)
        .optional(),
      company: z.string().trim().max(150).optional(),
      message: z.string().trim().max(2000).optional(),
      priority: z.enum(PRIORITIES).optional(),
      source: z.enum(SOURCES).optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, { message: 'No fields provided to update' }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(STATUSES, { errorMap: () => ({ message: `Status must be one of: ${STATUSES.join(', ')}` }) }),
  }),
});

const assignLeadSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'userId is required'),
  }),
});

const addNoteSchema = z.object({
  body: z.object({
    text: z.string().trim().min(1, 'Note text is required').max(2000),
  }),
});

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  updateStatusSchema,
  assignLeadSchema,
  addNoteSchema,
  STATUSES,
  PRIORITIES,
  SOURCES,
};
