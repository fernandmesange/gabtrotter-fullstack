import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { promisify } from 'node:util';
import bcrypt from 'bcryptjs';

const image = process.argv[2];
assert.ok(image, 'Usage: npm run test:docker -- <local image tag>');
const execute = promisify(execFile);
const docker = async (...args) => {
  try {
    return (await execute('docker', args, {
      timeout: 120_000, maxBuffer: 1024 * 1024,
    })).stdout.trim();
  } catch (error) {
    throw new Error(`Docker ${args[0]} failed with exit code ${error.code}.`);
  }
};
const suffix = randomBytes(8).toString('hex');
const network = `gabtrotter-ci-${suffix}`;
const mongo = `${network}-mongo`;
const app = `${network}-app`;
const password = randomBytes(24).toString('base64url');
const email = 'docker-agent@example.invalid';

async function waitFor(check, description) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      if (await check()) return;
    } catch {
      // Container startup can precede HTTP and MongoDB readiness.
    }
    await delay(500);
  }
  throw new Error(`Timed out waiting for ${description}.`);
}

async function request(baseUrl, route, options) {
  return fetch(`${baseUrl}${route}`, { ...options, signal: AbortSignal.timeout(5000) });
}

try {
  const [metadata] = JSON.parse(await docker('image', 'inspect', image));
  assert.equal(metadata.Config.Env.includes('NODE_ENV=production'), true);
  assert.deepEqual(metadata.Config.Cmd, ['node', 'index.js']);
  assert.ok(metadata.Config.User && !['root', '0'].includes(metadata.Config.User));
  assert.ok(metadata.Config.Healthcheck, 'The production image must have an HTTP healthcheck.');

  await docker('network', 'create', network);
  await docker('run', '--detach', '--name', mongo, '--network', network, 'mongo:7.0');
  await waitFor(async () => (
    await docker('exec', mongo, 'mongosh', '--quiet', '--eval', 'db.adminCommand({ping:1}).ok')
  ) === '1', 'MongoDB');
  const account = {
    email, password: await bcrypt.hash(password, 10), fullname: 'Agent Docker fictif',
    role: 'agent', isVerified: true, subscribeCourses: [],
  };
  await docker('exec', mongo, 'mongosh', '--quiet', 'gabtrotter_docker_test', '--eval',
    `db.users.insertOne(${JSON.stringify(account)});`);

  await docker('run', '--detach', '--name', app, '--network', network,
    '--publish', '127.0.0.1::5000',
    '--env', `MONGO_URL=mongodb://${mongo}:27017/gabtrotter_docker_test`,
    '--env', `JWT_SECRET=${randomBytes(32).toString('base64url')}`,
    '--env', `SURVEY_DATA_ENCRYPTION_KEY=${randomBytes(32).toString('base64')}`,
    '--env', 'FRONTEND_URL=http://localhost', image);
  const port = await docker('port', app, '5000/tcp');
  assert.match(port, /^127\.0\.0\.1:\d+$/);
  const baseUrl = `http://${port}`;
  await waitFor(async () => (
    await docker('inspect', '--format', '{{.State.Health.Status}}', app)
  ) === 'healthy', 'the production HTTP healthcheck');

  const page = await request(baseUrl, '/');
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  const html = await page.text();
  const assetPath = html.match(/src="(\/assets\/[^"\s]+\.js)"/)?.[1];
  assert.ok(assetPath, 'Express must serve the compiled React page.');
  assert.equal((await request(baseUrl, assetPath)).status, 200);

  const login = await request(baseUrl, '/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(login.status, 200, 'The packaged API must authenticate against MongoDB.');
  const session = await login.json();
  assert.equal(session.user.email, email);
  assert.ok(session.token);
  const auth = await request(baseUrl, '/api/auth/checkAuth', {
    headers: { Authorization: `Bearer ${session.token}` },
  });
  assert.equal(auth.status, 200, 'The packaged JWT configuration must validate the session.');
  assert.notEqual(await docker('exec', app, 'id', '-u'), '0');
  await docker('exec', app, 'node', '--input-type=module', '-e',
    "import assert from 'node:assert/strict'; import fs from 'node:fs'; for (const path of ['.env', 'test', 'node_modules/mongodb-memory-server']) assert.equal(fs.existsSync(path), false, path);");
  console.log('PASS: production entrypoint, HTTP healthcheck, compiled frontend, MongoDB login, JWT session and non-root runtime.');
} finally {
  await Promise.allSettled([docker('rm', '--force', app), docker('rm', '--force', mongo)]);
  await docker('network', 'rm', network).catch(() => {});
}
