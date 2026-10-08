import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import {
  startIntegrationServer, User, Survey, ResponseSurvey, SyncAudit,
} from '../test/helpers/integrationServer.js';

const server = await startIntegrationServer();
try {
  const password = randomBytes(24).toString('base64url');
  const receiptCode = randomBytes(24).toString('base64url');
  const passwordHash = await bcrypt.hash(password, 10);
  const [agent, supervisor] = await User.create([
    {
      email: 'synthetic-agent@example.invalid', password: passwordHash,
      fullname: 'Agent synthétique', role: 'agent', isVerified: true,
      mobileCode: '1234', subscribeCourses: [],
    },
    {
      email: 'synthetic-supervisor@example.invalid', password: passwordHash,
      fullname: 'Superviseur synthétique', role: 'supervisor', isVerified: true,
      mobileCode: '5678', subscribeCourses: [],
    },
  ]);
  const survey = await Survey.create({
    title: 'Campagne synthétique de collecte',
    fields: [{ type: 'text', label: 'Réponse' }],
    privacyNotice: {
      enabled: true, version: 1, legalBasis: 'CONSENT', requiresConsent: true,
      enforcedAt: new Date(Date.now() - 60_000), retentionDays: 30,
      locationPolicy: { enabled: true, required: false, purpose: 'Test synthétique' },
    },
  });
  const mobileDirectory = fileURLToPath(new URL('../../../gabtrotter-survey-app/', import.meta.url));
  console.log('Disposable MongoDB and loopback API ready. Running actual Flutter services.');
  await new Promise((resolve, reject) => {
    const child = spawn('flutter', [
      'test', '--no-pub', 'test/backend_round_trip.dart',
      `--dart-define=API_BASE_URL=${server.baseUrl}/api`, '--reporter', 'expanded',
    ], {
      cwd: mobileDirectory,
      stdio: 'inherit',
      env: {
        ...process.env,
        GABTROTTER_TEST_AGENT_EMAIL: agent.email,
        GABTROTTER_TEST_SUPERVISOR_EMAIL: supervisor.email,
        GABTROTTER_TEST_PASSWORD: password,
        GABTROTTER_TEST_SURVEY_ID: survey.id,
        GABTROTTER_TEST_RECEIPT_CODE: receiptCode,
      },
    });
    let killTimer;
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      killTimer = setTimeout(() => child.kill('SIGKILL'), 5000);
    }, 180_000);
    child.once('error', reject);
    child.once('close', (code, signal) => {
      clearTimeout(timeout);
      clearTimeout(killTimer);
      if (code === 0) resolve();
      else reject(new Error(`Flutter round trip failed (exit ${code}, signal ${signal}).`));
    });
  });

  const responses = await ResponseSurvey.find({}).select('+encryptedPayload +privacyReceiptCodeHash').lean();
  assert.equal(responses.length, 1, 'Retries must not create a second stored response.');
  const response = responses[0];
  assert.equal(String(response.agentId), agent.id);
  assert.equal(String(response.surveyId), survey.id);
  assert.equal(response.privacyNoticeVersion, 1);
  assert.equal(response.legalBasis, 'CONSENT');
  assert.match(response.encryptedPayload, /^v1\./);
  assert.equal(response.responses, undefined);
  assert.equal(response.location, undefined);
  assert.match(response.privacyReceiptCodeHash, /^[a-f0-9]{64}$/);
  const storedDocument = JSON.stringify(response);
  assert.equal(storedDocument.includes('Collecte synthétique hors ligne'), false);
  assert.equal(storedDocument.includes(receiptCode), false);

  const audits = await SyncAudit.find({}).sort({ createdAt: 1 }).lean();
  assert.equal(audits.length, 2);
  assert.deepEqual(audits.map((audit) => [
    audit.submittedCount, audit.syncedCount, audit.duplicateCount, audit.rejectedCount,
  ]), [[1, 1, 0, 0], [1, 0, 1, 0]]);
  assert.ok(audits.every((audit) => String(audit.agentId) === agent.id));
  assert.ok(audits.every((audit) => audit.results[0].responseId === String(response._id)));
  assert.equal(audits[0].deviceId, audits[1].deviceId);
  console.log('PASS: encrypted offline collection, real HTTP sync, duplicate retry, supervisor read and MongoDB audits.');
} finally {
  await server.stop();
}
