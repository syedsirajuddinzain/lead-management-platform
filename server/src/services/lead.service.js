const Lead = require('../models/Lead');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'name', 'status', 'priority'];

function pushActivity(lead, type, message, actorId = null) {
  lead.activity.push({ type, message, actor: actorId });
}

/**
 * Used by both the public capture form and the authenticated create-lead
 * flow. `createdBy` is null for public submissions.
 */
async function createLead(payload, createdBy = null) {
  const existing = await Lead.findOne({
    email: payload.email.toLowerCase(),
    phone: payload.phone,
    isDeleted: { $ne: true },
  });

  if (existing) {
    throw ApiError.conflict('A lead with this email and phone number already exists');
  }

  const lead = new Lead({
    ...payload,
    createdBy,
  });

  pushActivity(lead, 'LEAD_CREATED', 'Lead created', createdBy);
  await lead.save();
  return lead;
}

async function listLeads(query, requester) {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    source,
    assignedTo,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = { isDeleted: { $ne: true } };

  // Members only ever see leads assigned to them
  if (requester.role === 'member') {
    filter.assignedTo = requester._id;
  } else if (assignedTo) {
    filter.assignedTo = assignedTo === 'unassigned' ? null : assignedTo;
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (source) filter.source = source;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
  const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Lead.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('assignedTo', 'name email initials')
      .populate('createdBy', 'name email'),
    Lead.countDocuments(filter),
  ]);

  return {
    items,
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 },
  };
}

async function getLeadById(id, requester) {
  const lead = await Lead.findOne({ _id: id, isDeleted: { $ne: true } })
    .populate('assignedTo', 'name email initials')
    .populate('createdBy', 'name email')
    .populate('notes.author', 'name email initials')
    .populate('activity.actor', 'name email initials');

  if (!lead) throw ApiError.notFound('Lead not found');

  if (requester.role === 'member' && String(lead.assignedTo?._id) !== String(requester._id)) {
    throw ApiError.forbidden('You do not have access to this lead');
  }

  return lead;
}

/** Full field update - admin only (enforced at the route level). */
async function updateLead(id, updates, requester) {
  const lead = await Lead.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!lead) throw ApiError.notFound('Lead not found');

  Object.entries(updates).forEach(([key, value]) => {
    lead[key] = value;
  });

  pushActivity(lead, 'LEAD_UPDATED', 'Lead details updated', requester._id);
  await lead.save();
  return lead;
}

/** Status update - both admin and assigned member may do this. */
async function updateStatus(id, status, requester) {
  const lead = await Lead.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!lead) throw ApiError.notFound('Lead not found');

  if (requester.role === 'member' && String(lead.assignedTo) !== String(requester._id)) {
    throw ApiError.forbidden('You can only update leads assigned to you');
  }

  if (lead.status === status) return lead;

  const previous = lead.status;
  lead.status = status;
  pushActivity(lead, 'STATUS_CHANGED', `Status changed from ${previous} to ${status}`, requester._id);
  await lead.save();
  return lead;
}

async function assignLead(id, userId, requester) {
  const [lead, user] = await Promise.all([
    Lead.findOne({ _id: id, isDeleted: { $ne: true } }),
    User.findById(userId),
  ]);

  if (!lead) throw ApiError.notFound('Lead not found');
  if (!user) throw ApiError.notFound('Target user not found');
  if (!user.isActive) throw ApiError.badRequest('Cannot assign leads to a deactivated user');

  lead.assignedTo = user._id;
  pushActivity(lead, 'ASSIGNED', `Lead assigned to ${user.name}`, requester._id);
  await lead.save();
  return lead;
}

async function addNote(id, text, requester) {
  const lead = await Lead.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!lead) throw ApiError.notFound('Lead not found');

  if (requester.role === 'member' && String(lead.assignedTo) !== String(requester._id)) {
    throw ApiError.forbidden('You can only add notes to leads assigned to you');
  }

  lead.notes.push({ text, author: requester._id });
  pushActivity(lead, 'NOTE_ADDED', 'Note added', requester._id);
  await lead.save();
  return lead;
}

async function softDeleteLead(id) {
  const lead = await Lead.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!lead) throw ApiError.notFound('Lead not found');

  lead.isDeleted = true;
  await lead.save();
  return true;
}

async function getDashboardStats(requester) {
  const baseFilter = { isDeleted: { $ne: true } };
  if (requester.role === 'member') baseFilter.assignedTo = requester._id;

  const [byStatus, byPriority, total, recentActivity] = await Promise.all([
    Lead.aggregate([{ $match: baseFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Lead.aggregate([{ $match: baseFilter }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Lead.countDocuments(baseFilter),
    Lead.aggregate([
      { $match: baseFilter },
      { $unwind: '$activity' },
      { $sort: { 'activity.createdAt': -1 } },
      { $limit: 15 },
      {
        $project: {
          _id: 0,
          leadId: '$_id',
          leadName: '$name',
          type: '$activity.type',
          message: '$activity.message',
          actor: '$activity.actor',
          createdAt: '$activity.createdAt',
        },
      },
    ]),
  ]);

  const statusCounts = { New: 0, Contacted: 0, Qualified: 0, Won: 0, Lost: 0 };
  byStatus.forEach((s) => {
    statusCounts[s._id] = s.count;
  });

  const priorityCounts = { Low: 0, Medium: 0, High: 0 };
  byPriority.forEach((p) => {
    priorityCounts[p._id] = p.count;
  });

  const actorIds = [...new Set(recentActivity.filter((a) => a.actor).map((a) => String(a.actor)))];
  const actors = await User.find({ _id: { $in: actorIds } }).select('name initials');
  const actorMap = Object.fromEntries(actors.map((a) => [String(a._id), a]));

  return {
    total,
    statusCounts,
    priorityCounts,
    conversionRate: total > 0 ? Math.round((statusCounts.Won / total) * 100) : 0,
    recentActivity: recentActivity.map((a) => ({
      ...a,
      actor: a.actor ? actorMap[String(a.actor)] : null,
    })),
  };
}

module.exports = {
  createLead,
  listLeads,
  getLeadById,
  updateLead,
  updateStatus,
  assignLead,
  addNote,
  softDeleteLead,
  getDashboardStats,
};
