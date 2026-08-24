
import { cookies } from 'next/headers';
import { verifyClientToken } from './auth-edge';
import { getPrisma } from './prisma';

export async function getCurrentClient() {
  const token = (await cookies()).get('client_session')?.value;
  if (!token) return null;

  const payload = await verifyClientToken(token);
  if (!payload?.clientId || payload.role !== 'client') return null;

  const prisma = await getPrisma();

  const client = await prisma.client.findUnique({
    where: { id: payload.clientId },
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      phone: true,
      loginUsername: true,
      createdAt: true,
      updatedAt: true,

      services: {
        orderBy: {
          nextDueDate: 'asc',
        },
        select: {
          id: true,
          name: true,
          amount: true,
          billingCycle: true,
          billingAnchorDay: true,
          billingAnchorMonth: true,
          status: true,
          nextDueDate: true,
          gracePeriodStartedAt: true,
          createdAt: true,
          updatedAt: true,

          payments: {
            orderBy: {
              paidOn: 'desc',
            },
            select: {
              id: true,
              serviceId: true,
              amountPaid: true,
              paidOn: true,
              periodStart: true,
              periodEnd: true,
              receiptFileUrl: true,
              invoiceNumber: true,
              confirmedByAdminAt: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!client) return null;

  return {
    ...client,

    services: client.services.map((service) => ({
      ...service,
      amount: Number(service.amount),

      payments: service.payments.map((payment) => ({
        ...payment,
        amountPaid: Number(payment.amountPaid),
      })),
    })),
  };
}

