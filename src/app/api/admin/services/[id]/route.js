import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../../lib/prisma';
import { logAdminAction } from '../../../../../lib/audit';
import { badRequest, readJson, requireAdmin, unauthorized } from '../../../../../lib/admin-api';

export async function PATCH(request, { params }) {
  if (!await requireAdmin()) return unauthorized();
  const { id } = await params;
  const body = await readJson(request);
  const { name, amount, billingCycle, billingAnchorDay, billingAnchorMonth } = body || {};
  if (!name || amount === undefined || !billingCycle) return badRequest('name, amount, and billingCycle are required');
  if (billingCycle !== 'NO_RESTRICTION' && (!billingAnchorDay || !billingAnchorMonth)) return badRequest('billingAnchorDay and billingAnchorMonth are required for billing cycles');
  const prisma = await getPrisma();
  const before = await prisma.service.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  const service = await prisma.service.update({ where: { id }, data: { name, amount: String(amount), billingCycle, billingAnchorDay: billingCycle === 'NO_RESTRICTION' ? null : Number(billingAnchorDay), billingAnchorMonth: billingCycle === 'NO_RESTRICTION' ? null : Number(billingAnchorMonth) } });
  await logAdminAction('UPDATE_SERVICE', 'Service', id, { before: { name: before.name, amount: String(before.amount), billingCycle: before.billingCycle, billingAnchorDay: before.billingAnchorDay, billingAnchorMonth: before.billingAnchorMonth }, after: { name, amount: String(amount), billingCycle, billingAnchorDay, billingAnchorMonth } });
  return NextResponse.json(service);
}

export async function DELETE(request, { params }) {
  if (!await requireAdmin()) return unauthorized();
  const { id } = await params;
  const prisma = await getPrisma();
  const service = await prisma.service.findUnique({ where: { id }, select: { id: true, name: true, clientId: true } });
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  await prisma.service.delete({ where: { id } });
  await logAdminAction('DELETE_SERVICE', 'Service', id, { name: service.name, clientId: service.clientId });
  return NextResponse.json({ success: true });
}