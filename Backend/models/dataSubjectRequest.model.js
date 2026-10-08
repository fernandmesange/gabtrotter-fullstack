import mongoose from 'mongoose';

const DataSubjectRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true, index: true },
  submissionId: { type: String, required: true, index: true },
  responseId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResponseSurvey' },
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  type: {
    type: String,
    required: true,
    enum: ['ACCESS', 'RECTIFICATION', 'ERASURE', 'RESTRICTION', 'OBJECTION', 'WITHDRAW_CONSENT'],
  },
  status: {
    type: String,
    enum: ['RECEIVED', 'IN_REVIEW', 'COMPLETED', 'REJECTED'],
    default: 'RECEIVED',
    index: true,
  },
  accessCodeHash: { type: String, required: true, select: false },
  encryptedPayload: { type: String, required: true, select: false },
  identityVerifiedAt: { type: Date, required: true },
  deadlineAt: { type: Date, required: true },
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryAvailable: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

DataSubjectRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const DataSubjectRequest = mongoose.model('DataSubjectRequest', DataSubjectRequestSchema);
