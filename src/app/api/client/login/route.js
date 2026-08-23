import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../lib/prisma';
import { verifyPassword, signClientToken } from '../../../../lib/auth';
import { cookies } from 'next/headers';

const attempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function getIp(req) {
  return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
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

  const body = await req.json();
  const { username, password } = body || {};

  if (!username || !password) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const prisma = await getPrisma();
  const client = await prisma.client.findUnique({ where: { loginUsername: username } });
  if (!client) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const ok = await verifyPassword(password, client.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = signClientToken({ role: 'client', clientId: client.id });
  const cookieStore = await cookies();
  const host = new URL(req.url).hostname;
  const isSecure = process.env.NODE_ENV === 'production' && host !== 'localhost' && host !== '127.0.0.1';
  cookieStore.set({ name: 'client_session', value: token, httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/', maxAge: 24 * 60 * 60 });
  return NextResponse.json({ success: true });
}
