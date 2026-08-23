import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function hashPassword(plaintext) {
  return await bcrypt.hash(plaintext, 12);
}

export async function verifyPassword(plaintext, hash) {
  return await bcrypt.compare(plaintext, hash);
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not defined in environment`);
  return v;
}

export function signAdminToken(payload) {
  const secret = requireEnv('JWT_ADMIN_SECRET');
  return jwt.sign(payload, secret, { expiresIn: '2h' });
}

export function signClientToken(payload) {
  const secret = requireEnv('JWT_CLIENT_SECRET');
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

export function verifyAdminToken(token) {
  const secret = requireEnv('JWT_ADMIN_SECRET');
  try {
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
}

export function verifyClientToken(token) {
  const secret = requireEnv('JWT_CLIENT_SECRET');
  try {
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
}
