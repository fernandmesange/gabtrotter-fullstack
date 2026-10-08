import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';

function getKey() {
  const encoded = String(process.env.SURVEY_DATA_ENCRYPTION_KEY || '').trim();
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) {
    throw new Error('SURVEY_DATA_ENCRYPTION_KEY doit contenir 32 octets encodés en base64.');
  }
  return key;
}

export function assertSurveyEncryptionConfigured() {
  getKey();
}

export function encryptSurveyData(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(value), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join('.');
}

export function decryptSurveyData(envelope) {
  const [version, ivValue, tagValue, ciphertextValue] = String(envelope || '').split('.');
  if (version !== VERSION || !ivValue || !tagValue || !ciphertextValue) {
    throw new Error('Format de données chiffrées non reconnu.');
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivValue, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, 'base64url')),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString('utf8'));
}

export function presentSurveyResponse(document) {
  const value = typeof document?.toObject === 'function' ? document.toObject() : { ...document };
  if (value.encryptedPayload) {
    const decrypted = decryptSurveyData(value.encryptedPayload);
    value.responses = decrypted.responses;
    value.location = decrypted.location;
    value.consent = decrypted.consent ?? null;
  }
  delete value.encryptedPayload;
  return value;
}
