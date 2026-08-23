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
    include: {
      services: {
        include: {
          payments: { orderBy: { paidOn: 'desc' } },
        },
      },
    },
  });

  if (!client) return null;

  // Prisma's Decimal fields are class instances, not plain numbers —
  // React Server Components can't pass them to Client Components.
  // Convert every Decimal field to a plain number before returning.
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