const express = require('express');
const leadController = require('../controllers/lead.controller');
const validate = require('../middleware/validate.middleware');
const { publicLeadLimiter } = require('../middleware/rateLimit.middleware');
const { createLeadSchema } = require('../validations/lead.validation');

const router = express.Router();

// Public lead capture - no authentication, rate limited to deter spam/abuse
router.post('/leads', publicLeadLimiter, validate(createLeadSchema), leadController.submitPublicLead);

module.exports = router;
