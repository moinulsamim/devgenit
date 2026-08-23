import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../../../lib/prisma';
import { logAdminAction } from '../../../../../../lib/audit';
import { computeNextDueDate, generateInvoiceNumber } from '../../../../../../lib/billing';
import { paymentReceivedEmail, sendEmail } from '../../../../../../lib/emails';
import { badRequest, readJson, requireAdmin, unauthorized } from '../../../../../../lib/admin-api';

export async function POST(request, { params }) {
  if (!await requireAdmin()) return unauthorized();
  const { id } = await params;
  const body = await readJson(request);
  if (body?.amountPaid === undefined) return badRequest('amountPaid is required');
  const prisma = await getPrisma();
  const service = await prisma.service.findUnique({ where: { id }, include: { client: true } });
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  const periodStart = service.nextDueDate || new Date();
  const nextDueDate = computeNextDueDate(periodStart, service.billingCycle, service.billingAnchorDay, service.billingAnchorMonth);
  const periodEnd = nextDueDate || periodStart;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({ data: { serviceId: id, amountPaid: String(body.amountPaid), paidOn: new Date(), periodStart, periodEnd, receiptFileUrl: body.receiptFileUrl || null, invoiceNumber: generateInvoiceNumber() } });
      const updated = await tx.service.update({ where: { id }, data: { nextDueDate, status: 'ACTIVE', gracePeriodStartedAt: null } });
      await logAdminAction('CONFIRM_PAYMENT', 'Service', id, { before: { status: service.status, nextDueDate: service.nextDueDate }, after: { status: updated.status, nextDueDate: updated.nextDueDate }, paymentId: payment.id }, tx);
      return { payment, service: updated };
    });
    try {
      await sendEmail({
        to: service.client?.email,
        template: paymentReceivedEmail({
          clientName: service.client?.name || 'Client',
          serviceName: service.name,
          amountPaid: body.amountPaid,
          invoiceNumber: result.payment.invoiceNumber,
          nextDueDate: result.service.nextDueDate ? new Date(result.service.nextDueDate).toLocaleDateString('en-US') : null,
          receiptUrl: result.payment.receiptFileUrl,
        }),
      });
    } catch (emailError) {
      console.error('Payment received email failed', id, emailError.message);
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to confirm payment' }, { status: 500 });
  }
}