import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAccountSetupToken,
  requireRoles,
  requireSelfOrRoles,
  verifyAccountSetupToken,
} from '../controllers/user.controllers.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-with-sufficient-entropy';

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test('allows an authorized role', () => {
  let called = false;
  requireRoles('admin')({ user: { role: 'admin' } }, createResponse(), () => {
    called = true;
  });
  assert.equal(called, true);
});

test('rejects an unauthorized role', () => {
  const response = createResponse();
  requireRoles('admin')({ user: { role: 'agent' } }, response, () => {});
  assert.equal(response.statusCode, 403);
  assert.match(response.body.message, /non autorisé/);
});

test('allows a user to read only their own account', () => {
  let called = false;
  requireSelfOrRoles('admin', 'supervisor')(
    { userId: 'user-1', user: { role: 'agent' }, params: { userId: 'user-1' } },
    createResponse(),
    () => { called = true; },
  );
  assert.equal(called, true);
});

test('rejects horizontal access to another account', () => {
  const response = createResponse();
  requireSelfOrRoles('admin', 'supervisor')(
    { userId: 'user-1', user: { role: 'agent' }, params: { userId: 'user-2' } },
    response,
    () => {},
  );
  assert.equal(response.statusCode, 403);
});

test('allows supervisors to read another account', () => {
  let called = false;
  requireSelfOrRoles('admin', 'supervisor')(
    { userId: 'supervisor-1', user: { role: 'supervisor' }, params: { userId: 'user-2' } },
    createResponse(),
    () => { called = true; },
  );
  assert.equal(called, true);
});

test('account setup tokens are bound to one user', () => {
  const token = createAccountSetupToken('user-1');
  assert.equal(verifyAccountSetupToken(token, 'user-1').purpose, 'account-setup');
  assert.throws(() => verifyAccountSetupToken(token, 'user-2'), /invalide/);
});
