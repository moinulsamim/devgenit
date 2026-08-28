import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../../../lib/prisma';
import { logAdminAction } from '../../../../../../lib/audit';
import { computeNextDueDate, generateInvoiceNumber } from '../../../../../../lib/billing';
import { paymentReceivedEmail, sendEmail } from '../../../../../../lib/emails';
import { requireAdmin, unauthorized } from '../../../../../../lib/admin-api';

export async function POST(request, { params }) {
  if (!await requireAdmin()) return unauthorized();
  const { claimId } = await params;
  const prisma = await getPrisma();

  const claim = await prisma.paymentClaim.findUnique({
    where: { id: claimId },
    include: { service: { include: { client: true } } },
  });

  if (!claim) return NextResponse.json({ error: 'Payment claim not found' }, { status: 404 });
  if (claim.status !== 'PENDING') {
    return NextResponse.json({ error: `This claim was already ${claim.status.toLowerCase()}.` }, { status: 409 });
  }

  const service = claim.service;
  const periodStart = service.nextDueDate || new Date();
  const nextDueDate = computeNextDueDate(periodStart, service.billingCycle, service.billingAnchorDay, service.billingAnchorMonth);
  const periodEnd = nextDueDate || periodStart;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          serviceId: service.id,
          amountPaid: String(claim.claimedAmount),
          paidOn: new Date(),
          periodStart,
          periodEnd,
          receiptFileUrl: null,
          invoiceNumber: generateInvoiceNumber(),
        },
      });

      const updatedService = await tx.service.update({
        where: { id: service.id },
        data: { nextDueDate, status: 'ACTIVE', gracePeriodStartedAt: null },
      });

      const updatedClaim = await tx.paymentClaim.update({
        where: { id: claim.id },
        data: { status: 'CONFIRMED', resolvedAt: new Date() },
      });

      await logAdminAction('CONFIRM_PAYMENT_CLAIM', 'Service', service.id, {
        claimId: claim.id,
        claimedAmount: String(claim.claimedAmount),
        before: { status: service.status, nextDueDate: service.nextDueDate },
        after: { status: updatedService.status, nextDueDate: updatedService.nextDueDate },
        paymentId: payment.id,
      }, tx);

      return { payment, service: updatedService, claim: updatedClaim };
    });

    try {
      await sendEmail({
        to: service.client?.email,
        template: paymentReceivedEmail({
          clientName: service.client?.name || 'Client',
          serviceName: service.name,
          amountPaid: claim.claimedAmount,
          invoiceNumber: result.payment.invoiceNumber,
          nextDueDate: result.service.nextDueDate ? new Date(result.service.nextDueDate).toLocaleDateString('en-US') : null,
          receiptUrl: null,
        }),
      });
    } catch (emailError) {
      console.error('Payment received email failed', service.id, emailError.message);
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to confirm this payment claim' }, { status: 500 });
  }
}