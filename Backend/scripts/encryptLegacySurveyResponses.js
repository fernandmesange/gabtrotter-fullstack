import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ResponseSurvey } from '../models/responseSurvey.model.js';
import { Survey } from '../models/survey.model.js';
import { encryptSurveyData } from '../services/surveyDataEncryption.service.js';
import { calculateExpiry } from '../services/surveySync.service.js';

dotenv.config();

const applyChanges = process.argv.includes('--apply');
const defaultRetentionDays = Number(process.env.SURVEY_DEFAULT_RETENTION_DAYS || 365);

async function run() {
  if (!process.env.MONGO_URL) throw new Error('MONGO_URL est requis.');

  // Validate the key before opening a migration cursor.
  encryptSurveyData({ validation: true });
  await mongoose.connect(process.env.MONGO_URL);

  const legacyFilter = {
    responses: { $exists: true },
    $or: [
      { encryptedPayload: { $exists: false } },
      { encryptedPayload: null },
    ],
  };
  const total = await ResponseSurvey.countDocuments(legacyFilter);
  console.log(`${total} réponse(s) historique(s) à chiffrer. Mode: ${applyChanges ? 'APPLICATION' : 'SIMULATION'}.`);

  if (!applyChanges || total === 0) return;

  const retentionBySurvey = new Map();
  let migrated = 0;
  const cursor = ResponseSurvey.find(legacyFilter).select('+encryptedPayload').cursor();

  for await (const response of cursor) {
    const surveyKey = response.surveyId.toString();
    if (!retentionBySurvey.has(surveyKey)) {
      const survey = await Survey.findById(response.surveyId).select('privacyNotice');
      retentionBySurvey.set(surveyKey, {
        retentionDays: Number(survey?.privacyNotice?.retentionDays || defaultRetentionDays),
        legalBasis: survey?.privacyNotice?.legalBasis,
        noticeVersion: survey?.privacyNotice?.version,
      });
    }

    const policy = retentionBySurvey.get(surveyKey);
    const retentionStart = response.receivedAt || response.createdAt || new Date();
    const metadata = {
      encryptedPayload: encryptSurveyData({
        responses: response.responses,
        location: response.location,
        consent: null,
      }),
      expiresAt: calculateExpiry(retentionStart, policy.retentionDays),
    };
    const legalBasis = response.legalBasis || policy.legalBasis;
    const noticeVersion = response.privacyNoticeVersion || policy.noticeVersion;
    if (legalBasis) metadata.legalBasis = legalBasis;
    if (noticeVersion) metadata.privacyNoticeVersion = noticeVersion;

    await ResponseSurvey.collection.updateOne(
      {
        _id: response._id,
        $or: [
          { encryptedPayload: { $exists: false } },
          { encryptedPayload: null },
        ],
      },
      {
        $set: metadata,
        $unset: { responses: '', location: '' },
      },
    );
    migrated += 1;
  }

  console.log(`${migrated} réponse(s) chiffrée(s). Aucun contenu de réponse n'a été journalisé.`);
}

run()
  .catch((error) => {
    console.error(`Migration interrompue: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
