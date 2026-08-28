import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyClientToken } from '../../../../../../lib/auth-edge';
import { getPrisma } from '../../../../../../lib/prisma';

export async function POST(request, { params }) {
  const token = (await cookies()).get('client_session')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyClientToken(token);
  if (!payload?.clientId || payload.role !== 'client') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: serviceId } = await params;
  const body = await request.json().catch(() => null);
  const amount = body?.amount;
  const note = typeof body?.note === 'string' ? body.note.slice(0, 500) : null;

  if (amount === undefined || amount === null || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ error: 'A valid payment amount is required' }, { status: 400 });
  }

  const prisma = await getPrisma();
  const service = await prisma.service.findUnique({ where: { id: serviceId } });

  // Same response whether the service doesn't exist or belongs to another
  // client — never reveal which case it is to an authenticated caller.
  if (!service || service.clientId !== payload.clientId) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  // A service on NO_RESTRICTION billing has no due date at all, so there's
  // nothing meaningful to report a payment against. Every other status —
  // ACTIVE, DUE_SOON, OVERDUE, BLOCKED — is a valid moment for a client to
  // say "I've paid," whether they're ahead of schedule or catching up.
  if (service.billingCycle === 'NO_RESTRICTION') {
    return NextResponse.json(
      { error: 'This service does not have a billing cycle to report a payment against.' },
      { status: 400 }
    );
  }

  const existingPending = await prisma.paymentClaim.findFirst({
    where: { serviceId, status: 'PENDING' },
  });
  if (existingPending) {
    return NextResponse.json(
      { error: 'You already have a payment report awaiting confirmation for this service.' },
      { status: 409 }
    );
  }

  const claim = await prisma.paymentClaim.create({
    data: {
      serviceId,
      claimedAmount: String(amount),
      claimedForDate: service.nextDueDate,
      note,
    },
  });

  return NextResponse.json({ id: claim.id, status: claim.status }, { status: 201 });
}