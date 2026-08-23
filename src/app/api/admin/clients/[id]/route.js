import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../../lib/prisma';
import { logAdminAction } from '../../../../../lib/audit';
import { badRequest, readJson, requireAdmin, unauthorized } from '../../../../../lib/admin-api';

export async function GET(request, { params }) {
  if (!await requireAdmin()) return unauthorized();
  const { id } = await params;
  const prisma = await getPrisma();
  const client = await prisma.client.findUnique({ where: { id }, include: { services: { include: { payments: { orderBy: { paidOn: 'desc' } } } } } });
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  return NextResponse.json(client);
}

export async function PATCH(request, { params }) {
  if (!await requireAdmin()) return unauthorized();
  const { id } = await params;
  const body = await readJson(request);
  const { name, company, email, phone } = body || {};
  if (!name || !email) return badRequest('name and email are required');
  const prisma = await getPrisma();
  try {
    const before = await prisma.client.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    const client = await prisma.client.update({ where: { id }, data: { name, company: company || null, email, phone: phone || null } });
    await logAdminAction('UPDATE_CLIENT', 'Client', id, { before: { name: before.name, company: before.company, email: before.email, phone: before.phone }, after: { name, company: company || null, email, phone: phone || null } });
    return NextResponse.json(client);
  } catch (error) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Email is already in use' }, { status: 409 });
    return NextResponse.json({ error: 'Unable to update client' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!await requireAdmin()) return unauthorized();
  const { id } = await params;
  const prisma = await getPrisma();
  const client = await prisma.client.findUnique({ where: { id }, select: { id: true, name: true, email: true } });
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  await prisma.client.delete({ where: { id } });
  await logAdminAction('DELETE_CLIENT', 'Client', id, { name: client.name, email: client.email });
  return NextResponse.json({ success: true });
}