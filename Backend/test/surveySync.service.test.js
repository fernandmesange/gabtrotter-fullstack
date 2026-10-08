import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateExpiry, validateSyncItem } from '../services/surveySync.service.js';

const validItem = {
  submissionId: 'e01ab76a-3456-4eb2-8f74-51ff65f228d5',
  surveyId: '507f1f77bcf86cd799439011',
  surveyVersion: 2,
  fields: { age: 34, avis: 'favorable' },
  localDate: '2026-08-23T10:00:00.000Z',
  deviceId: 'tablet-001',
  location: { latitude: 0.3924, longitude: 9.4536, accuracy: 12 },
};

test('accepts a complete offline submission', () => {
  assert.deepEqual(validateSyncItem(validItem), []);
});

test('rejects a malformed submission before database access', () => {
  const errors = validateSyncItem({ ...validItem, submissionId: '', surveyVersion: 0 });
  assert.equal(errors.length, 2);
  assert.match(errors.join(' '), /submissionId/);
  assert.match(errors.join(' '), /surveyVersion/);
});

test('requires structured fields but accepts an absent optional location', () => {
  const errors = validateSyncItem({ ...validItem, fields: [], location: null });
  assert.equal(errors.length, 1);
  assert.match(errors.join(' '), /fields/);
});

test('accepts versioned consent evidence', () => {
  const errors = validateSyncItem({
    ...validItem,
    consent: {
      noticeVersion: 2,
      recordedAt: '2026-08-23T09:55:00.000Z',
      accepted: true,
      captureMethod: 'RESPONDENT_DIRECT_ON_DEVICE',
      respondentConfirmed: true,
    },
  });
  assert.deepEqual(errors, []);
});

test('rejects incomplete consent evidence', () => {
  const errors = validateSyncItem({
    ...validItem,
    consent: { noticeVersion: 0, recordedAt: 'invalid', accepted: 'yes' },
  });
  assert.equal(errors.length, 5);
});

test('calculates the response expiration date from the survey retention period', () => {
  assert.equal(
    calculateExpiry('2026-01-01T00:00:00.000Z', 30).toISOString(),
    '2026-01-31T00:00:00.000Z',
  );
});
