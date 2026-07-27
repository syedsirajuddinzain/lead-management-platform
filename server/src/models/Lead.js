const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['LEAD_CREATED', 'ASSIGNED', 'STATUS_CHANGED', 'NOTE_ADDED', 'LEAD_UPDATED'],
      required: true,
    },
    message: { type: String, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = system/public submission
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^[\w.-]+@[\w.-]+\.\w+$/, 'Invalid email format'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [/^[+]?[\d\s()-]{7,20}$/, 'Invalid phone number'],
    },
    company: { type: String, trim: true, maxlength: 150, default: '' },
    message: { type: String, trim: true, maxlength: 2000, default: '' },

    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Won', 'Lost'],
      default: 'New',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    source: {
      type: String,
      enum: ['Website', 'Referral', 'LinkedIn', 'Other'],
      default: 'Website',
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null when submitted via the public capture form
    },

    notes: [noteSchema],
    activity: [activitySchema],

    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate submissions: same email + phone combination
leadSchema.index({ email: 1, phone: 1 });

// Text index to support search across key fields
leadSchema.index({ name: 'text', email: 'text', company: 'text' });

leadSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Lead', leadSchema);
