import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../../../lib/prisma';
import { logAdminAction } from '../../../../../../lib/audit';
import { computeNextDueDate } from '../../../../../../lib/billing';
import { badRequest, readJson, requireAdmin, unauthorized } from '../../../../../../lib/admin-api';

export async function POST(request, { params }) {
  if (!await requireAdmin()) return unauthorized();
  const { id: clientId } = await params;
  const body = await readJson(request);
  const { name, amount, billingCycle, billingAnchorDay, billingAnchorMonth } = body || {};
  if (!name || amount === undefined || !billingCycle) return badRequest('name, amount, and billingCycle are required');
  if (billingCycle !== 'NO_RESTRICTION' && (!billingAnchorDay || !billingAnchorMonth)) return badRequest('billingAnchorDay and billingAnchorMonth are required for billing cycles');
  const today = new Date();
  const nextDueDate = computeNextDueDate(today, billingCycle, Number(billingAnchorDay), Number(billingAnchorMonth));
  const prisma = await getPrisma();
  try {
    const service = await prisma.service.create({ data: { clientId, name, amount: String(amount), billingCycle, billingAnchorDay: billingCycle === 'NO_RESTRICTION' ? null : Number(billingAnchorDay), billingAnchorMonth: billingCycle === 'NO_RESTRICTION' ? null : Number(billingAnchorMonth), nextDueDate } });
    await logAdminAction('CREATE_SERVICE', 'Service', service.id, { clientId, name, amount: String(amount), billingCycle });
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    return NextResponse.json({ error: 'Unable to create service' }, { status: 500 });
  }
}