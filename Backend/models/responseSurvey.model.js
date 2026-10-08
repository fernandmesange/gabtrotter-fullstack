import mongoose from 'mongoose';

const ResponseSurveySchema = new mongoose.Schema({
  submissionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true,
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  responses: {
    type: Object,
    required: false,
  },
  encryptedPayload: {
    type: String,
    required: false,
    select: false,
  },
  surveyVersion: {
    type: Number,
    required: true,
    min: 1,
  },
  localDate:{
    type: Date,
    required: true
  },
  location:{
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  deviceId: {
    type: String,
    required: true,
  },
  receivedAt: {
    type: Date,
    default: Date.now,
  },
  privacyNoticeVersion: { type: Number, min: 1 },
  consentRecordedAt: Date,
  legalBasis: String,
  privacyReceiptCodeHash: {
    type: String,
    select: false,
    index: true,
    sparse: true,
  },
  processingRestricted: { type: Boolean, default: false, index: true },
  restrictionReason: String,
  restrictedAt: Date,
  rectifiedAt: Date,
  expiresAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

ResponseSurveySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ResponseSurvey = mongoose.model('ResponseSurvey', ResponseSurveySchema);
