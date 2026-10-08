import crypto, { randomUUID } from 'crypto';
import { DataSubjectRequest } from '../models/dataSubjectRequest.model.js';
import { ResponseSurvey } from '../models/responseSurvey.model.js';
import { Survey } from '../models/survey.model.js';
import {
  decryptSurveyData,
  encryptSurveyData,
  presentSurveyResponse,
} from './surveyDataEncryption.service.js';

const REQUEST_RETENTION_DAYS = 730;
const REQUEST_DEADLINE_DAYS = 30;
const REQUEST_TYPES = new Set([
  'ACCESS',
  'RECTIFICATION',
  'ERASURE',
  'RESTRICTION',
  'OBJECTION',
  'WITHDRAW_CONSENT',
]);

export const hashPrivacyReceiptCode = (code) => crypto
  .createHash('sha256')
  .update(String(code || '').trim(), 'utf8')
  .digest('hex');

const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

function codesMatch(expectedHash, code) {
  const actual = Buffer.from(hashPrivacyReceiptCode(code), 'hex');
  const expected = Buffer.from(String(expectedHash || ''), 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

async function findResponseWithReceipt(submissionId, accessCode) {
  const response = await ResponseSurvey.findOne({ submissionId }).select(
    '+privacyReceiptCodeHash +encryptedPayload',
  );
  if (!response || !response.privacyReceiptCodeHash || !codesMatch(response.privacyReceiptCodeHash, accessCode)) {
    throw Object.assign(new Error('Reçu confidentiel invalide.'), { statusCode: 401 });
  }
  return response;
}

export async function createRightsRequest({ submissionId, accessCode, type, contactEmail, details }) {
  if (!submissionId || !accessCode || !REQUEST_TYPES.has(type)) {
    throw Object.assign(new Error('Identifiant, code confidentiel et type de demande valides requis.'), {
      statusCode: 400,
    });
  }
  const response = await findResponseWithReceipt(submissionId, accessCode);
  const now = new Date();
  return DataSubjectRequest.create({
    requestId: randomUUID(),
    submissionId,
    responseId: response._id,
    surveyId: response.surveyId,
    type,
    accessCodeHash: hashPrivacyReceiptCode(accessCode),
    encryptedPayload: encryptSurveyData({
      contactEmail: contactEmail?.trim() || null,
      details: details?.trim() || null,
    }),
    identityVerifiedAt: now,
    deadlineAt: addDays(now, REQUEST_DEADLINE_DAYS),
    expiresAt: addDays(now, REQUEST_RETENTION_DAYS),
  });
}

async function findRequestWithCode(requestId, accessCode) {
  const request = await DataSubjectRequest.findOne({ requestId }).select(
    '+accessCodeHash +encryptedPayload',
  );
  if (!request || !codesMatch(request.accessCodeHash, accessCode)) {
    throw Object.assign(new Error('Demande ou code confidentiel invalide.'), { statusCode: 401 });
  }
  return request;
}

export async function getRightsRequestStatus({ requestId, accessCode }) {
  const request = await findRequestWithCode(requestId, accessCode);
  return {
    requestId: request.requestId,
    type: request.type,
    status: request.status,
    requestedAt: request.createdAt,
    deadlineAt: request.deadlineAt,
    resolvedAt: request.resolvedAt,
    deliveryAvailable: request.deliveryAvailable,
  };
}

export async function getRightsAccessPackage({ requestId, accessCode }) {
  const request = await findRequestWithCode(requestId, accessCode);
  if (request.type !== 'ACCESS' || request.status !== 'COMPLETED' || !request.deliveryAvailable) {
    throw Object.assign(new Error('Le dossier d’accès n’est pas disponible.'), { statusCode: 409 });
  }
  const response = await ResponseSurvey.findById(request.responseId).select('+encryptedPayload');
  if (!response) throw Object.assign(new Error('Les données ont été supprimées.'), { statusCode: 410 });
  const survey = await Survey.findById(response.surveyId).select('title privacyNotice.controllerName');
  const presented = presentSurveyResponse(response);
  return {
    controllerName: survey?.privacyNotice?.controllerName,
    surveyTitle: survey?.title,
    submissionId: response.submissionId,
    surveyVersion: response.surveyVersion,
    collectedAt: response.localDate,
    receivedAt: response.receivedAt,
    legalBasis: response.legalBasis,
    privacyNoticeVersion: response.privacyNoticeVersion,
    responses: presented.responses,
    location: presented.location,
    consent: presented.consent,
  };
}

export async function listRightsRequests() {
  const requests = await DataSubjectRequest.find().select('+encryptedPayload').sort({ createdAt: -1 });
  return requests.map((request) => {
    const value = request.toObject();
    const privateData = decryptSurveyData(value.encryptedPayload);
    delete value.encryptedPayload;
    return { ...value, ...privateData };
  });
}

export async function resolveRightsRequest({ requestId, actorId, approved, correctedFields, notes }) {
  const request = await DataSubjectRequest.findOne({ requestId }).select('+encryptedPayload');
  if (!request) throw Object.assign(new Error('Demande introuvable.'), { statusCode: 404 });
  if (['COMPLETED', 'REJECTED'].includes(request.status)) {
    throw Object.assign(new Error('Cette demande est déjà clôturée.'), { statusCode: 409 });
  }

  const privateData = decryptSurveyData(request.encryptedPayload);
  if (!approved) {
    request.status = 'REJECTED';
    request.resolvedAt = new Date();
    request.resolvedBy = actorId;
    request.encryptedPayload = encryptSurveyData({ ...privateData, resolutionNotes: notes || null });
    await request.save();
    return request;
  }

  const response = request.responseId
    ? await ResponseSurvey.findById(request.responseId).select('+encryptedPayload')
    : null;
  if (!response && request.type !== 'ERASURE') {
    throw Object.assign(new Error('Réponse associée introuvable.'), { statusCode: 410 });
  }

  if (request.type === 'RECTIFICATION') {
    if (!correctedFields || typeof correctedFields !== 'object' || Array.isArray(correctedFields)) {
      throw Object.assign(new Error('Les champs corrigés sont requis.'), { statusCode: 400 });
    }
    const payload = decryptSurveyData(response.encryptedPayload);
    response.encryptedPayload = encryptSurveyData({
      ...payload,
      responses: { ...payload.responses, ...correctedFields },
    });
    response.rectifiedAt = new Date();
    await response.save();
  } else if (request.type === 'ERASURE') {
    if (response) await ResponseSurvey.deleteOne({ _id: response._id });
    request.responseId = null;
  } else if (['RESTRICTION', 'OBJECTION', 'WITHDRAW_CONSENT'].includes(request.type)) {
    response.processingRestricted = true;
    response.restrictionReason = request.type;
    response.restrictedAt = new Date();
    await response.save();
  } else if (request.type === 'ACCESS') {
    request.deliveryAvailable = true;
  }

  request.status = 'COMPLETED';
  request.resolvedAt = new Date();
  request.resolvedBy = actorId;
  request.encryptedPayload = encryptSurveyData({ ...privateData, resolutionNotes: notes || null });
  await request.save();
  return request;
}
