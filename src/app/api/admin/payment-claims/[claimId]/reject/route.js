import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../../../lib/prisma';
import { logAdminAction } from '../../../../../../lib/audit';
import { readJson, requireAdmin, unauthorized } from '../../../../../../lib/admin-api';

export async function POST(request, { params }) {
  if (!await requireAdmin()) return unauthorized();
  const { claimId } = await params;
  const body = await readJson(request);
  const reason = typeof body?.reason === 'string' ? body.reason.slice(0, 500) : null;

  const prisma = await getPrisma();
  const claim = await prisma.paymentClaim.findUnique({ where: { id: claimId } });
  if (!claim) return NextResponse.json({ error: 'Payment claim not found' }, { status: 404 });
  if (claim.status !== 'PENDING') {
    return NextResponse.json({ error: `This claim was already ${claim.status.toLowerCase()}.` }, { status: 409 });
  }

  const updated = await prisma.paymentClaim.update({
    where: { id: claimId },
    data: { status: 'REJECTED', resolvedAt: new Date(), resolutionNote: reason },
  });

  await logAdminAction('REJECT_PAYMENT_CLAIM', 'Service', claim.serviceId, { claimId, reason });

  return NextResponse.json(updated);
}