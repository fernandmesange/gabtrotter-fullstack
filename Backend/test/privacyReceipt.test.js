import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPrivacyReceiptCode } from '../services/dataSubjectRights.service.js';

test('hashes a privacy receipt deterministically without retaining the secret', () => {
  const receipt = 'ABCD-EFGH-IJKL-MNOP-QRSTUV';
  const hash = hashPrivacyReceiptCode(receipt);

  assert.equal(hash, hashPrivacyReceiptCode(`  ${receipt}  `));
  assert.equal(hash.length, 64);
  assert.doesNotMatch(hash, /ABCD/);
  assert.notEqual(hash, hashPrivacyReceiptCode('ABCD-EFGH-IJKL-MNOP-QRSTUX'));
});
