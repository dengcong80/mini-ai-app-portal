const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  userDescription: {type: String, required: true},
  appDescription: String,
  appName: String,
  entities: [String],
  roles: [String],
  features: [String],
  raos: [{
    role: String,
    action: String,
    object: String,
    supplementary: String
  }],
  mockHtml: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add creator field
  createdAt: { type: Date, default: Date.now }
});
requirementSchema.index({ createdBy: 1, createdAt: -1 });
requirementSchema.index({ appName: 1 });
requirementSchema.index({ mockHtml: 1 });


module.exports = mongoose.model('Requirement', requirementSchema);
