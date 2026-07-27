const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const leadService = require('../services/lead.service');

// Public - anyone can submit a lead (no auth)
const submitPublicLead = asyncHandler(async (req, res) => {
  const lead = await leadService.createLead(req.body, null);
  new ApiResponse(201, { lead }, 'Thank you! Your submission has been received.').send(res);
});

// Authenticated - admin creates a lead directly
const createLead = asyncHandler(async (req, res) => {
  const lead = await leadService.createLead(req.body, req.user._id);
  new ApiResponse(201, { lead }, 'Lead created successfully').send(res);
});

const listLeads = asyncHandler(async (req, res) => {
  const { items, meta } = await leadService.listLeads(req.validatedQuery || req.query, req.user);
  new ApiResponse(200, items, 'Leads fetched successfully', meta).send(res);
});

const getLead = asyncHandler(async (req, res) => {
  const lead = await leadService.getLeadById(req.params.id, req.user);
  new ApiResponse(200, { lead }).send(res);
});

const updateLead = asyncHandler(async (req, res) => {
  const lead = await leadService.updateLead(req.params.id, req.body, req.user);
  new ApiResponse(200, { lead }, 'Lead updated successfully').send(res);
});

const updateStatus = asyncHandler(async (req, res) => {
  const lead = await leadService.updateStatus(req.params.id, req.body.status, req.user);
  new ApiResponse(200, { lead }, 'Status updated successfully').send(res);
});

const assignLead = asyncHandler(async (req, res) => {
  const lead = await leadService.assignLead(req.params.id, req.body.userId, req.user);
  new ApiResponse(200, { lead }, 'Lead assigned successfully').send(res);
});

const addNote = asyncHandler(async (req, res) => {
  const lead = await leadService.addNote(req.params.id, req.body.text, req.user);
  new ApiResponse(201, { lead }, 'Note added successfully').send(res);
});

const deleteLead = asyncHandler(async (req, res) => {
  await leadService.softDeleteLead(req.params.id);
  new ApiResponse(200, null, 'Lead deleted successfully').send(res);
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await leadService.getDashboardStats(req.user);
  new ApiResponse(200, stats).send(res);
});

module.exports = {
  submitPublicLead,
  createLead,
  listLeads,
  getLead,
  updateLead,
  updateStatus,
  assignLead,
  addNote,
  deleteLead,
  getDashboardStats,
};
