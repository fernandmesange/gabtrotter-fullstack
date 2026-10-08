import mongoose from 'mongoose';

const SyncResultSchema = new mongoose.Schema({
  submissionId: { type: String, required: true },
  status: {
    type: String,
    enum: ['synced', 'duplicate', 'rejected'],
    required: true,
  },
  responseId: String,
  reason: String,
}, { _id: false });

const SyncAuditSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true, index: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceId: { type: String, required: true },
  submittedCount: { type: Number, required: true },
  syncedCount: { type: Number, required: true },
  duplicateCount: { type: Number, required: true },
  rejectedCount: { type: Number, required: true },
  results: { type: [SyncResultSchema], default: [] },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 400 * 24 * 60 * 60 * 1000),
  },
}, { timestamps: true });

SyncAuditSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SyncAudit = mongoose.model('SyncAudit', SyncAuditSchema);
