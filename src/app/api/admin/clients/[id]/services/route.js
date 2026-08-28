import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../../../lib/prisma';
import { logAdminAction } from '../../../../../../lib/audit';
import { computeNextDueDate } from '../../../../../../lib/billing';
import { badRequest, readJson, requireAdmin, unauthorized } from '../../../../../../lib/admin-api';

export async function POST(request, { params }) {
  if (!await requireAdmin()) return unauthorized();
  const { id: clientId } = await params;
  const body = await readJson(request);
  const { name, amount, billingCycle, billingAnchorDay, billingAnchorMonth, firstDueDate } = body || {};
  if (!name || amount === undefined || !billingCycle) return badRequest('name, amount, and billingCycle are required');
  if (billingCycle !== 'NO_RESTRICTION' && (!billingAnchorDay || !billingAnchorMonth)) return badRequest('billingAnchorDay and billingAnchorMonth are required for billing cycles');

  let nextDueDate = null;
  let backdated = false;

  if (billingCycle !== 'NO_RESTRICTION') {
    if (firstDueDate) {
      // Admin is onboarding a client who already has an existing balance —
      // use the real original due date instead of computing one from today.
      // This lets the existing cron job (daily-billing-check) discover the
      // service as overdue on its own and drive status/grace-period/emails
      // exactly like it would for any other service, rather than us trying
      // to set status by hand and risking it drifting out of sync with the
      // cron's own logic.
      const parsed = new Date(firstDueDate);
      if (Number.isNaN(parsed.getTime())) return badRequest('firstDueDate is not a valid date');
      nextDueDate = parsed;
      backdated = true;
    } else {
      const today = new Date();
      nextDueDate = computeNextDueDate(today, billingCycle, Number(billingAnchorDay), Number(billingAnchorMonth));
    }
  }

  const prisma = await getPrisma();
  try {
    const service = await prisma.service.create({
      data: {
        clientId,
        name,
        amount: String(amount),
        billingCycle,
        billingAnchorDay: billingCycle === 'NO_RESTRICTION' ? null : Number(billingAnchorDay),
        billingAnchorMonth: billingCycle === 'NO_RESTRICTION' ? null : Number(billingAnchorMonth),
        nextDueDate,
      },
    });
    await logAdminAction('CREATE_SERVICE', 'Service', service.id, {
      clientId,
      name,
      amount: String(amount),
      billingCycle,
      ...(backdated ? { backdatedFirstDueDate: nextDueDate } : {}),
    });
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    return NextResponse.json({ error: 'Unable to create service' }, { status: 500 });
  }
}