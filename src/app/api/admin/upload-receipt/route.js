import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import { requireAdmin, unauthorized } from '../../../../lib/admin-api';

const allowed = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const extensions = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' };

export async function POST(request) {
  if (!await requireAdmin()) return unauthorized();
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Receipt storage is not configured' }, { status: 503 });
  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file.arrayBuffer !== 'function') return NextResponse.json({ error: 'A receipt file is required' }, { status: 400 });
  if (!allowed.has(file.type)) return NextResponse.json({ error: 'Only PDF, JPG, JPEG, and PNG receipts are allowed' }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Receipt must be 5MB or smaller' }, { status: 400 });
  const path = `${crypto.randomUUID()}.${extensions[file.type]}`;
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const upload = await supabase.storage.from('receipts').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });
  const signed = await supabase.storage.from('receipts').createSignedUrl(path, 7 * 24 * 60 * 60);
  if (signed.error) return NextResponse.json({ error: signed.error.message }, { status: 500 });
  return NextResponse.json({ path, signedUrl: signed.data.signedUrl });
}