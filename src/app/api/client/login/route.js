import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../lib/prisma';
import { verifyPassword, signClientToken } from '../../../../lib/auth';
import { cookies } from 'next/headers';

const attempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

// Constant-time defense: used when no client matches, so response timing
// doesn't reveal whether the email exists. Generate your own once via
// `bcrypt.hash('anything-random', 12)` and hardcode it here — do NOT
// regenerate it per-request (that defeats the purpose) and do NOT reuse
// this exact value in production, generate your own.
const DUMMY_HASH = '$2b$12$E3SoSFYYU5BFs5yn2E/pHOSWPtce8tw84mMmsr7TkDDGUg3MQOsrK';

function getIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim(); // first entry = original client
  return req.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = attempts.get(ip) || { count: 0, firstAt: now };
  if (now - entry.firstAt > WINDOW_MS) {
    entry.count = 0;
    entry.firstAt = now;
  }
  entry.count += 1;
  attempts.set(ip, entry);
  if (entry.count > MAX_ATTEMPTS) return false;
  return true;
}

export async function POST(req) {
  const ip = getIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many failed attempts, try again later' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const prisma = await getPrisma();
  const client = await prisma.client.findUnique({ where: { email } });

  // Always run bcrypt, even when no client was found, against a fixed
  // dummy hash. This keeps response time ~constant whether the email
  // exists or not, closing the enumeration timing side-channel.
  const hashToCheck = client ? client.passwordHash : DUMMY_HASH;
  const ok = await verifyPassword(password, hashToCheck);

  if (!client || !ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signClientToken({ role: 'client', clientId: client.id });
  const cookieStore = await cookies();
  const host = new URL(req.url).hostname;
  const isSecure = process.env.NODE_ENV === 'production' && host !== 'localhost' && host !== '127.0.0.1';
  cookieStore.set({
    name: 'client_session',
    value: token,
    httpOnly: true,
    secure: isSecure,
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60,
  });
  return NextResponse.json({ success: true });
}