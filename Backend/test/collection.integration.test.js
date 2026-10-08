import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import {
  startIntegrationServer, User, Survey, ResponseSurvey, SyncAudit, DataSubjectRequest,
} from './helpers/integrationServer.js';

let server;
let survey;
let sessions;
const password = 'disposable-test-password';
const deviceId = 'test-tablet';
const receipt = 'TEST-RESPONDENT-CONFIDENTIAL-RECEIPT';

async function request(path, { token, body, method = 'GET' } = {}) {
  const response = await fetch(`${server.baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, body: await response.json() };
}

function submission(overrides = {}) {
  const collectedAt = new Date().toISOString();
  return {
    submissionId: randomUUID(),
    surveyId: survey._id.toString(),
    surveyVersion: 1,
    localDate: collectedAt,
    fields: { age: 34, avis: 'favorable' },
    privacyReceiptCode: receipt,
    consent: {
      noticeVersion: 1,
      recordedAt: collectedAt,
      accepted: true,
      captureMethod: 'RESPONDENT_DIRECT_ON_DEVICE',
      respondentConfirmed: true,
    },
    ...overrides,
  };
}

function sync(responses, batchId = randomUUID(), token = sessions.agent.token) {
  return request('/api/surveys/sync', {
    method: 'POST', token, body: { batchId, deviceId, responses },
  });
}

before(async () => { server = await startIntegrationServer(); });
after(async () => { if (server) await server.stop(); });

beforeEach(async () => {
  await Promise.all([User, Survey, ResponseSurvey, SyncAudit, DataSubjectRequest].map(
    (model) => model.deleteMany({}),
  ));
  const hashedPassword = await bcrypt.hash(password, 4);
  sessions = {};
  for (const role of ['agent', 'supervisor', 'admin', 'beneficiary']) {
    const user = await User.create({
      email: `${role}@tests.invalid`, password: hashedPassword, fullname: role, role,
      isVerified: true, subscribeCourses: [],
    });
    const login = await request('/api/auth/login', {
      method: 'POST', body: { email: user.email, password },
    });
    assert.equal(login.status, 200);
    sessions[role] = { user, token: login.body.token };
  }
  survey = await Survey.create({
    title: 'Campagne de test', fields: [{ type: 'number', label: 'age' }],
    privacyNotice: { enforcedAt: new Date(Date.now() - 60000), retentionDays: 30 },
  });
});

test('une connexion valide ouvre une session, un mot de passe incorrect ou un jeton invalide est refusé', async () => {
  const login = await request('/api/auth/login', {
    method: 'POST', body: { email: sessions.agent.user.email, password },
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.role, 'agent');
  const auth = await request('/api/auth/checkAuth', { token: login.body.token });
  assert.equal(auth.status, 200);
  assert.equal(auth.body.isAuthenticated, true);
  assert.equal(auth.body.user.userId, sessions.agent.user._id.toString());
  const invalidLogin = await request('/api/auth/login', {
    method: 'POST', body: { email: sessions.agent.user.email, password: 'wrong-password' },
  });
  assert.equal(invalidLogin.status, 400);
  assert.equal(invalidLogin.body.token, undefined);
  assert.equal((await request('/api/auth/checkAuth', { token: 'invalid' })).status, 401);
  await User.deleteOne({ _id: sessions.agent.user._id });
  assert.equal((await request('/api/auth/checkAuth', { token: login.body.token })).status, 401);
});

test('un agent lit les campagnes mais seul un superviseur ou administrateur peut en créer', async () => {
  assert.equal((await request('/api/surveys')).status, 401);
  const read = await request('/api/surveys', { token: sessions.agent.token });
  assert.equal(read.status, 200);
  assert.deepEqual(read.body.map((item) => item.title), ['Campagne de test']);
  const body = { title: 'Nouvelle campagne', fields: [{ type: 'text', label: 'avis' }] };
  assert.equal((await request('/api/surveys/create', {
    method: 'POST', token: sessions.agent.token, body,
  })).status, 403);
  const created = await request('/api/surveys/create', {
    method: 'POST', token: sessions.supervisor.token, body,
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.title, 'Nouvelle campagne');
  assert.equal(created.body.privacyNotice.version, 1);
  assert.equal(await Survey.countDocuments(), 2);
});

test('la synchronisation sans session ou avec un rôle bénéficiaire ne persiste aucune réponse', async () => {
  const item = submission();
  assert.equal((await sync([item], randomUUID(), null)).status, 401);
  assert.equal((await sync([item], randomUUID(), sessions.beneficiary.token)).status, 403);
  assert.equal(await ResponseSurvey.countDocuments(), 0);
  assert.equal(await SyncAudit.countDocuments(), 0);
});

test('une collecte acceptée est chiffrée en MongoDB et consultable seulement par un rôle autorisé', async () => {
  const item = submission();
  const accepted = await sync([item]);
  assert.equal(accepted.status, 200);
  assert.equal(accepted.body.data.results[0].status, 'synced');
  const responseId = accepted.body.data.results[0].responseId;
  const stored = await ResponseSurvey.collection.findOne({ submissionId: item.submissionId });
  assert.equal(stored.agentId.toString(), sessions.agent.user._id.toString());
  assert.equal(stored.deviceId, deviceId);
  assert.equal(stored.responses, undefined);
  assert.equal(stored.location, undefined);
  assert.match(stored.encryptedPayload, /^v1\./);
  assert.equal(JSON.stringify(stored).includes('favorable'), false);
  assert.equal(JSON.stringify(stored).includes(receipt), false);
  assert.equal(stored.expiresAt.getTime() - stored.receivedAt.getTime(), 30 * 86400000);
  assert.equal((await request(`/api/surveys/responses/${responseId}`)).status, 401);
  assert.equal((await request(`/api/surveys/responses/${responseId}`, { token: sessions.agent.token })).status, 403);
  const read = await request(`/api/surveys/responses/${responseId}`, { token: sessions.supervisor.token });
  assert.equal(read.status, 200);
  assert.deepEqual(read.body.responses, { age: 34, avis: 'favorable' });
  assert.deepEqual(read.body.consent, item.consent);
  assert.equal(read.body.encryptedPayload, undefined);
  assert.equal(read.body.privacyReceiptCodeHash, undefined);
});

test('rejouer un lot puis une soumission dans un nouveau lot conserve une seule réponse', async () => {
  const item = submission();
  const batchId = randomUUID();
  const first = await sync([item], batchId);
  assert.equal(first.status, 200);
  assert.equal(first.body.data.results[0].status, 'synced');
  const replay = await sync([item], batchId);
  assert.equal(replay.status, 200);
  assert.deepEqual(replay.body.data, first.body.data);
  const newBatch = await sync([item]);
  assert.equal(newBatch.status, 200);
  assert.equal(newBatch.body.data.results[0].status, 'duplicate');
  assert.equal(newBatch.body.data.results[0].responseId, first.body.data.results[0].responseId);
  assert.equal(await ResponseSurvey.countDocuments(), 1);
  assert.equal(await SyncAudit.countDocuments(), 2);
});

test('deux envois simultanés de la même soumission ne créent pas de doublon', async () => {
  const item = submission();
  const attempts = await Promise.all([sync([item]), sync([item])]);
  assert.deepEqual(attempts.map((attempt) => attempt.status), [200, 200]);
  assert.deepEqual(attempts.map((attempt) => attempt.body.data.results[0].status).sort(), ['duplicate', 'synced']);
  assert.equal(attempts[0].body.data.results[0].responseId, attempts[1].body.data.results[0].responseId);
  assert.equal(await ResponseSurvey.countDocuments(), 1);
  assert.equal(await SyncAudit.countDocuments(), 2);
});

test('les preuves manquantes, périmées ou refusées et une version inconnue sont rejetées sans persistance', async () => {
  const valid = submission();
  const items = [
    submission({ consent: undefined }),
    submission({ consent: { ...valid.consent, noticeVersion: 2 } }),
    submission({ consent: { ...valid.consent, accepted: false } }),
    submission({ privacyReceiptCode: undefined }),
    submission({ surveyVersion: 2 }),
  ];
  const rejected = await sync(items);
  assert.equal(rejected.status, 200);
  assert.equal(rejected.body.data.rejectedCount, 5);
  assert.deepEqual(rejected.body.data.results.map((item) => item.status), Array(5).fill('rejected'));
  assert.match(rejected.body.data.results[0].reason, /notice en vigueur/);
  assert.match(rejected.body.data.results[1].reason, /notice en vigueur/);
  assert.match(rejected.body.data.results[2].reason, /consentement/);
  assert.match(rejected.body.data.results[3].reason, /reçu confidentiel/);
  assert.match(rejected.body.data.results[4].reason, /Version/);
  assert.equal(await ResponseSurvey.countDocuments(), 0);
});

test('un lot partiellement valide accuse réception de chaque soumission et persiste seulement la réponse valide', async () => {
  const duplicate = submission();
  const first = await sync([duplicate]);
  assert.equal(first.body.data.results[0].status, 'synced');
  const valid = submission();
  const invalid = submission({ fields: [] });
  const mixed = await sync([valid, duplicate, invalid]);
  assert.equal(mixed.status, 200);
  assert.deepEqual(mixed.body.data.results.map(({ submissionId, status }) => ({ submissionId, status })), [
    { submissionId: valid.submissionId, status: 'synced' },
    { submissionId: duplicate.submissionId, status: 'duplicate' },
    { submissionId: invalid.submissionId, status: 'rejected' },
  ]);
  assert.equal(mixed.body.data.submittedCount, 3);
  assert.equal(mixed.body.data.syncedCount, 1);
  assert.equal(mixed.body.data.duplicateCount, 1);
  assert.equal(mixed.body.data.rejectedCount, 1);
  assert.equal(await ResponseSurvey.countDocuments(), 2);
});

test('le reçu donne accès à sa collecte après validation administrateur et permet son effacement', async () => {
  const item = submission();
  assert.equal((await sync([item])).body.data.results[0].status, 'synced');
  const rightsBody = { submissionId: item.submissionId, accessCode: receipt, type: 'ACCESS' };
  assert.equal((await request('/api/privacy/requests', {
    method: 'POST', body: { ...rightsBody, accessCode: 'wrong-code' },
  })).status, 401);
  const created = await request('/api/privacy/requests', { method: 'POST', body: rightsBody });
  assert.equal(created.status, 201);
  assert.equal(created.body.status, 'RECEIVED');
  const accessBody = { requestId: created.body.requestId, accessCode: receipt };
  assert.equal((await request('/api/privacy/requests/access', { method: 'POST', body: accessBody })).status, 409);
  const resolutionPath = `/api/privacy/requests/${created.body.requestId}`;
  assert.equal((await request(resolutionPath, {
    method: 'PATCH', token: sessions.supervisor.token, body: { approved: true },
  })).status, 403);
  assert.equal((await request(resolutionPath, {
    method: 'PATCH', token: sessions.admin.token, body: { approved: true },
  })).body.status, 'COMPLETED');
  assert.equal((await request('/api/privacy/requests/access', {
    method: 'POST', body: { ...accessBody, accessCode: 'wrong-code' },
  })).status, 401);
  const access = await request('/api/privacy/requests/access', { method: 'POST', body: accessBody });
  assert.equal(access.status, 200);
  assert.equal(access.body.submissionId, item.submissionId);
  assert.deepEqual(access.body.responses, { age: 34, avis: 'favorable' });
  const erasure = await request('/api/privacy/requests', {
    method: 'POST', body: { ...rightsBody, type: 'ERASURE' },
  });
  assert.equal(erasure.status, 201);
  const erased = await request(`/api/privacy/requests/${erasure.body.requestId}`, {
    method: 'PATCH', token: sessions.admin.token, body: { approved: true },
  });
  assert.equal(erased.status, 200);
  assert.equal(erased.body.status, 'COMPLETED');
  assert.equal(await ResponseSurvey.countDocuments(), 0);
  assert.equal((await request('/api/privacy/requests/access', { method: 'POST', body: accessBody })).status, 410);
});
