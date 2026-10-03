import crypto from 'crypto';
import type { PrismaClient } from '@prisma/client';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12; // Standard 96-bit IV for AES-GCM
const ENCRYPTED_PREFIX = 'enc:v1:';

/**
 * Resolves the 32-byte encryption key for Aadhaar AES-256-GCM encryption.
 * Prefers AADHAAR_ENCRYPTION_KEY, falling back to JWT_SECRET derived key if absent.
 */
function getAadhaarKey(customKey?: string): Buffer {
  const secret = customKey || process.env.AADHAAR_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'Aadhaar encryption requires AADHAAR_ENCRYPTION_KEY or JWT_SECRET to be configured in environment.'
    );
  }
  // Derive uniform 256-bit key using SHA-256
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Checks whether full encrypted storage is legally requested via environment configuration.
 * By default in India under UIDAI regulations, schools should store masked Aadhaar only.
 */
export function isAadhaarFullStorageRequired(): boolean {
  return (
    process.env.AADHAAR_FULL_STORAGE_REQUIRED === 'true' ||
    process.env.AADHAAR_FULL_STORAGE_REQUIRED === '1'
  );
}

/**
 * Normalizes an Aadhaar string by removing spaces, hyphens, and whitespace.
 */
export function normalizeAadhaar(raw: string): string {
  return raw.replace(/[\s-]/g, '').trim();
}

/**
 * Checks if a string is a valid 12-digit Aadhaar number.
 */
export function isValidAadhaarNumber(raw: string): boolean {
  const clean = normalizeAadhaar(raw);
  return /^\d{12}$/.test(clean);
}

/**
 * Checks if a string is already in standard masked format:
 * e.g. 'XXXX-XXXX-1234' or 'XXXXXXXX1234'
 */
export function isAadhaarMasked(raw: string): boolean {
  const trimmed = raw.trim();
  return (
    /^([Xx*]{4}-[Xx*]{4}-\d{4})$/.test(trimmed) ||
    /^([Xx*]{8}\d{4})$/.test(trimmed)
  );
}

/**
 * Masks a 12-digit Aadhaar number, keeping only the last 4 digits visible.
 * e.g. '123456789012' -> 'XXXX-XXXX-9012'
 */
export function maskAadhaar(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // If already standard masked
  if (trimmed.startsWith('XXXX-XXXX-') && trimmed.length === 14) {
    return trimmed;
  }

  const clean = normalizeAadhaar(trimmed);
  if (clean.length === 12 && /^\d{12}$/.test(clean)) {
    const last4 = clean.slice(-4);
    return `XXXX-XXXX-${last4}`;
  }

  // If masked format like XXXXXXXX1234
  if (clean.length === 12 && /^[Xx\d]{8}\d{4}$/.test(clean)) {
    const last4 = clean.slice(-4);
    return `XXXX-XXXX-${last4}`;
  }

  // If only 4 digits provided
  if (/^\d{4}$/.test(clean)) {
    return `XXXX-XXXX-${clean}`;
  }

  throw new Error('Invalid Aadhaar format for masking');
}

/**
 * Encrypts a plaintext Aadhaar number using AES-256-GCM.
 * Output format: enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
export function encryptAadhaar(rawAadhaar: string, customKey?: string): string {
  const clean = normalizeAadhaar(rawAadhaar);
  if (!isValidAadhaarNumber(clean)) {
    throw new Error('Cannot encrypt invalid Aadhaar number: must be 12 digits');
  }

  const key = getAadhaarKey(customKey);
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(clean, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${ENCRYPTED_PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts an AES-256-GCM encrypted Aadhaar ciphertext.
 */
export function decryptAadhaar(payload: string, customKey?: string): string {
  if (!payload.startsWith(ENCRYPTED_PREFIX)) {
    throw new Error('Invalid Aadhaar ciphertext payload: missing prefix');
  }

  const parts = payload.slice(ENCRYPTED_PREFIX.length).split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid Aadhaar ciphertext format: expected 3 parts');
  }

  const [ivHex, authTagHex, cipherHex] = parts;
  const key = getAadhaarKey(customKey);
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const ciphertext = Buffer.from(cipherHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Ingestion pipeline for incoming Aadhaar input:
 * - If full storage is legally requested, encrypts via AES-256-GCM.
 * - Otherwise, stores masked last-4 ('XXXX-XXXX-1234') compliant with UIDAI regulations.
 */
export function processAadhaarForStorage(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // If already encrypted, preserve
  if (trimmed.startsWith(ENCRYPTED_PREFIX)) {
    return trimmed;
  }

  // If full storage is legally enabled
  if (isAadhaarFullStorageRequired()) {
    if (isValidAadhaarNumber(trimmed)) {
      return encryptAadhaar(trimmed);
    }
  }

  // Default: store masked last-4
  return maskAadhaar(trimmed);
}

/**
 * Sanitizes stored Aadhaar for display on user interfaces or APIs.
 * Plaintext 12-digit numbers are NEVER returned.
 */
export function sanitizeAadhaarForDisplay(stored: string | null | undefined): string | null {
  if (!stored) return null;
  const trimmed = stored.trim();
  if (!trimmed) return null;

  // If stored as encrypted payload, decrypt and mask
  if (trimmed.startsWith(ENCRYPTED_PREFIX)) {
    try {
      const plaintext = decryptAadhaar(trimmed);
      return maskAadhaar(plaintext);
    } catch {
      return 'XXXX-XXXX-****'; // Fallback if decryption key unavailable
    }
  }

  // If stored as plaintext or partially masked, ensure uniform masked output
  try {
    return maskAadhaar(trimmed);
  } catch {
    return 'XXXX-XXXX-****';
  }
}

/**
 * Scans the database and backfills/migrates any legacy plaintext Aadhaar numbers.
 */
export async function migrateAadhaarRecords(db: PrismaClient): Promise<{
  totalChecked: number;
  migrated: number;
}> {
  const applications = await db.admissionApplication.findMany({
    where: {
      aadhaarNumber: {
        not: null,
      },
    },
    select: {
      id: true,
      aadhaarNumber: true,
    },
  });

  let migrated = 0;
  for (const app of applications) {
    if (!app.aadhaarNumber) continue;
    const current = app.aadhaarNumber.trim();

    // If it's a raw 12-digit number (not masked and not encrypted)
    if (!current.startsWith(ENCRYPTED_PREFIX) && !current.startsWith('XXXX-XXXX-')) {
      const secureValue = processAadhaarForStorage(current);
      await db.admissionApplication.update({
        where: { id: app.id },
        data: { aadhaarNumber: secureValue },
      });
      migrated++;
    }
  }

  return { totalChecked: applications.length, migrated };
}
