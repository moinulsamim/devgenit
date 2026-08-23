import { jwtVerify } from 'jose';

async function verifyToken(token, secretName) {
  const secret = process.env[secretName];
  if (!secret) return null;
  try {
    const result = await jwtVerify(token, new TextEncoder().encode(secret));
    return result.payload;
  } catch (error) {
    return null;
  }
}

export function verifyAdminToken(token) {
  return verifyToken(token, 'JWT_ADMIN_SECRET');
}

export function verifyClientToken(token) {
  return verifyToken(token, 'JWT_CLIENT_SECRET');
}