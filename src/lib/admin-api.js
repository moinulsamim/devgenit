import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from './auth';

export async function requireAdmin() {
  const token = (await cookies()).get('admin_session')?.value;
  if (!token) return null;
  try {
    return verifyAdminToken(token);
  } catch (error) {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return null;
  }
}

export function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}