import mongoose from 'mongoose';

const ResponseSurveySchema = new mongoose.Schema({
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
    required: true,
  },
  localDate:{
    type: Date,
    required: true
  },
  location:{
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export const ResponseSurvey = mongoose.model('ResponseSurvey', ResponseSurveySchema);
