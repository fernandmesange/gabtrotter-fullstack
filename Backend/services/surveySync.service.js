import mongoose from 'mongoose';
import { ResponseSurvey } from '../models/responseSurvey.model.js';
import { Survey } from '../models/survey.model.js';
import { SyncAudit } from '../models/syncAudit.model.js';
import { encryptSurveyData } from './surveyDataEncryption.service.js';
import { hashPrivacyReceiptCode } from './dataSubjectRights.service.js';

const MAX_BATCH_SIZE = 100;
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

export const calculateExpiry = (from, retentionDays) => {
  const days = Number(retentionDays);
  if (!Number.isFinite(days) || days < 1 || days > 3650) {
    throw new Error('La durée de conservation doit être comprise entre 1 et 3650 jours.');
  }
  return new Date(new Date(from).getTime() + days * 24 * 60 * 60 * 1000);
};

export const validateSyncItem = (item) => {
  const errors = [];
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return ['La réponse doit être un objet.'];
  }
  if (!isNonEmptyString(item.submissionId)) errors.push('submissionId est requis.');
  if (!mongoose.isValidObjectId(item.surveyId)) errors.push('surveyId est invalide.');
  if (!Number.isInteger(item.surveyVersion) || item.surveyVersion < 1) {
    errors.push('surveyVersion doit être un entier positif.');
  }
  if (!item.fields || typeof item.fields !== 'object' || Array.isArray(item.fields)) {
    errors.push('fields doit être un objet.');
  }
  if (!isNonEmptyString(item.localDate) || Number.isNaN(Date.parse(item.localDate))) {
    errors.push('localDate est invalide.');
  }
  if (!isNonEmptyString(item.deviceId)) errors.push('deviceId est requis.');
  if (item.location != null && typeof item.location !== 'object') errors.push('location doit être un objet.');
  if (item.privacyReceiptCode != null && !isNonEmptyString(item.privacyReceiptCode)) {
    errors.push('privacyReceiptCode est invalide.');
  }
  if (item.consent != null) {
    if (!Number.isInteger(item.consent.noticeVersion) || item.consent.noticeVersion < 1) {
      errors.push('consent.noticeVersion est invalide.');
    }
    if (!isNonEmptyString(item.consent.recordedAt) || Number.isNaN(Date.parse(item.consent.recordedAt))) {
      errors.push('consent.recordedAt est invalide.');
    }
    if (typeof item.consent.accepted !== 'boolean') errors.push('consent.accepted est requis.');
    if (!isNonEmptyString(item.consent.captureMethod)) errors.push('consent.captureMethod est requis.');
    if (item.consent.respondentConfirmed !== true) errors.push('consent.respondentConfirmed est requis.');
  }
  return errors;
};

const synchronizeItem = async (item, agentId) => {
  const validationErrors = validateSyncItem(item);
  if (validationErrors.length > 0) {
    return {
      submissionId: item?.submissionId || 'inconnu',
      status: 'rejected',
      reason: validationErrors.join(' '),
    };
  }

  const existing = await ResponseSurvey.findOne({ submissionId: item.submissionId });
  if (existing) {
    return {
      submissionId: item.submissionId,
      status: 'duplicate',
      responseId: existing._id.toString(),
    };
  }

  const survey = await Survey.findById(item.surveyId).select('_id version privacyNotice');
  if (!survey) {
    return { submissionId: item.submissionId, status: 'rejected', reason: 'Questionnaire introuvable.' };
  }
  if (item.surveyVersion > survey.version) {
    return {
      submissionId: item.submissionId,
      status: 'rejected',
      reason: 'Version du questionnaire inconnue du serveur.',
    };
  }

  const notice = survey.privacyNotice;
  const enforcementDate = notice?.enforcedAt ? new Date(notice.enforcedAt) : null;
  const collectedAt = new Date(item.localDate);
  const consentRequired = Boolean(
    notice?.enabled && enforcementDate && collectedAt >= enforcementDate,
  );
  const locationPolicy = notice?.locationPolicy || {};
  if (locationPolicy.enabled && locationPolicy.required && !item.location) {
    return {
      submissionId: item.submissionId,
      status: 'rejected',
      reason: 'La géolocalisation requise pour cette campagne est absente.',
    };
  }
  if (!locationPolicy.enabled && item.location) {
    return {
      submissionId: item.submissionId,
      status: 'rejected',
      reason: 'Cette campagne ne prévoit pas de géolocalisation.',
    };
  }
  if (consentRequired) {
    if (!item.consent || item.consent.noticeVersion !== notice.version) {
      return {
        submissionId: item.submissionId,
        status: 'rejected',
        reason: 'La preuve d’information ne correspond pas à la notice en vigueur.',
      };
    }
    if (notice.requiresConsent && item.consent.accepted !== true) {
      return {
        submissionId: item.submissionId,
        status: 'rejected',
        reason: 'Le consentement requis pour cette campagne n’a pas été recueilli.',
      };
    }
    if (item.consent.captureMethod !== 'RESPONDENT_DIRECT_ON_DEVICE' || item.consent.respondentConfirmed !== true) {
      return {
        submissionId: item.submissionId,
        status: 'rejected',
        reason: 'La confirmation directe du répondant est requise.',
      };
    }
    if (!isNonEmptyString(item.privacyReceiptCode)) {
      return {
        submissionId: item.submissionId,
        status: 'rejected',
        reason: 'Le reçu confidentiel du répondant est requis.',
      };
    }
  }

  try {
    const retentionDays = Number(notice?.retentionDays || process.env.SURVEY_DEFAULT_RETENTION_DAYS || 365);
    const receivedAt = new Date();
    const saved = await ResponseSurvey.create({
      submissionId: item.submissionId,
      surveyId: item.surveyId,
      surveyVersion: item.surveyVersion,
      agentId,
      encryptedPayload: encryptSurveyData({
        responses: item.fields,
        location: item.location,
        consent: item.consent ?? null,
      }),
      localDate: new Date(item.localDate),
      deviceId: item.deviceId,
      receivedAt,
      privacyNoticeVersion: item.consent?.noticeVersion ?? notice?.version,
      consentRecordedAt: item.consent?.recordedAt ? new Date(item.consent.recordedAt) : null,
      legalBasis: notice?.legalBasis,
      privacyReceiptCodeHash: item.privacyReceiptCode
        ? hashPrivacyReceiptCode(item.privacyReceiptCode)
        : undefined,
      expiresAt: calculateExpiry(receivedAt, retentionDays),
    });
    return {
      submissionId: item.submissionId,
      status: 'synced',
      responseId: saved._id.toString(),
    };
  } catch (error) {
    if (error?.code === 11000) {
      const duplicate = await ResponseSurvey.findOne({ submissionId: item.submissionId });
      return {
        submissionId: item.submissionId,
        status: 'duplicate',
        responseId: duplicate?._id?.toString(),
      };
    }
    throw error;
  }
};

export const synchronizeBatch = async ({ batchId, deviceId, responses, agentId }) => {
  if (!isNonEmptyString(batchId)) throw new Error('batchId est requis.');
  if (!isNonEmptyString(deviceId)) throw new Error('deviceId est requis.');
  if (!Array.isArray(responses) || responses.length === 0) {
    throw new Error('Le lot doit contenir au moins une réponse.');
  }
  if (responses.length > MAX_BATCH_SIZE) {
    throw new Error(`Le lot ne peut pas dépasser ${MAX_BATCH_SIZE} réponses.`);
  }

  const previousAudit = await SyncAudit.findOne({ batchId });
  if (previousAudit) return previousAudit.toObject();

  const results = [];
  for (const response of responses) {
    results.push(await synchronizeItem({ ...response, deviceId }, agentId));
  }

  const audit = await SyncAudit.create({
    batchId,
    agentId,
    deviceId,
    submittedCount: responses.length,
    syncedCount: results.filter((result) => result.status === 'synced').length,
    duplicateCount: results.filter((result) => result.status === 'duplicate').length,
    rejectedCount: results.filter((result) => result.status === 'rejected').length,
    results,
  });
  return audit.toObject();
};
