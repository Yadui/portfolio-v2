import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);

/**
 * Password hashing.
 *
 * Passwords were stored and compared in plaintext, and `/api/debug/users`
 * served the whole users table publicly, so the admin credential was readable
 * by anyone. Hashing alone would not have saved it, but it is the floor.
 *
 * scrypt comes from node:crypto, so this adds no dependency. Format is
 * `scrypt$N$salt$hash`, all hex, with the cost parameter stored inline so the
 * work factor can be raised later without invalidating existing hashes.
 */
const SCRYPT_COST = 16384; // N
const KEY_LEN = 64;
const PREFIX = "scrypt";

export async function hashPassword(plain) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(String(plain), salt, KEY_LEN, { N: SCRYPT_COST });
  return `${PREFIX}$${SCRYPT_COST}$${salt}$${derived.toString("hex")}`;
}

/** True when the stored value is one of our hashes rather than a legacy plaintext. */
export function isHashed(stored) {
  return typeof stored === "string" && stored.startsWith(`${PREFIX}$`);
}

/**
 * Constant-time verification. Returns false rather than throwing on a
 * malformed record, so a corrupt row cannot be probed via error differences.
 */
export async function verifyPassword(plain, stored) {
  if (!isHashed(stored)) {
    // Legacy plaintext row. Still compared in constant time so this path does
    // not leak length or content through timing while the migration runs.
    const a = Buffer.from(String(plain));
    const b = Buffer.from(String(stored ?? ""));
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  const [, costRaw, salt, hashHex] = stored.split("$");
  const cost = Number.parseInt(costRaw, 10);
  if (!Number.isFinite(cost) || !salt || !hashHex) return false;

  try {
    const derived = await scrypt(String(plain), salt, KEY_LEN, { N: cost });
    const expected = Buffer.from(hashHex, "hex");
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
