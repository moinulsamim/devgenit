import { NextResponse } from 'next/server';
import fs from 'fs';
import { verifyPassword, signAdminToken } from '../../../../lib/auth';
import { cookies } from 'next/headers';

const attempts = new Map(); // ip -> { count, firstAt }
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
  const { email, password } = body || {};

  if (!email || !password) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  let adminEmail = process.env.ADMIN_EMAIL;
  let adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminHash) {
    try {
      const envRaw = fs.readFileSync('.env', 'utf8');
      const mEmail = envRaw.match(/^ADMIN_EMAIL=(.*)$/m);
      const mHash = envRaw.match(/^ADMIN_PASSWORD_HASH=(.*)$/m);
      if (mEmail) adminEmail = mEmail[1].trim().replace(/^"|"$/g, '');
      if (mHash) adminHash = mHash[1].trim().replace(/^"|"$/g, '');
    } catch (e) {
      // ignore
    }
  }

  if (!adminEmail || !adminHash) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  if (email !== adminEmail) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const ok = await verifyPassword(password, adminHash);
  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = signAdminToken({ role: 'admin' });
  const cookieStore = await cookies();
  const host = new URL(req.url).hostname;
  const isSecure = process.env.NODE_ENV === 'production' && host !== 'localhost' && host !== '127.0.0.1';
  cookieStore.set({ name: 'admin_session', value: token, httpOnly: true, secure: isSecure, sameSite: 'strict', path: '/', maxAge: 2 * 60 * 60 });
  return NextResponse.json({ success: true });
}
