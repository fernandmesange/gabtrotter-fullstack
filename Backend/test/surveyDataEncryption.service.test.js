import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

process.env.SURVEY_DATA_ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');
const { decryptSurveyData, encryptSurveyData, presentSurveyResponse } = await import(
  '../services/surveyDataEncryption.service.js'
);

test('encrypts and authenticates sensitive survey data', () => {
  const payload = {
    responses: { health: 'sensitive answer' },
    location: { latitude: 0.4, longitude: 9.4 },
    consent: { noticeVersion: 1, accepted: true },
  };
  const encrypted = encryptSurveyData(payload);
  assert.equal(encrypted.includes('sensitive answer'), false);
  assert.deepEqual(decryptSurveyData(encrypted), payload);
  const parts = encrypted.split('.');
  const ciphertext = Buffer.from(parts[3], 'base64url');
  ciphertext[0] ^= 1;
  parts[3] = ciphertext.toString('base64url');
  assert.throws(() => decryptSurveyData(parts.join('.')), /authenticate/);
});

test('presents encrypted records without exposing the ciphertext', () => {
  const encryptedPayload = encryptSurveyData({
    responses: { answer: 'yes' },
    location: { latitude: 1 },
    consent: null,
  });
  const presented = presentSurveyResponse({ encryptedPayload, submissionId: 'submission-1' });
  assert.deepEqual(presented.responses, { answer: 'yes' });
  assert.equal('encryptedPayload' in presented, false);
});
