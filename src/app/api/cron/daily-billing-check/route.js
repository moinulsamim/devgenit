import { getPrisma } from '../../../../lib/prisma';
import { logAdminAction } from '../../../../lib/audit';
import { dueSoonEmail, sendEmail, serviceBlockedEmail } from '../../../../lib/emails';

export const runtime = 'nodejs';

async function sendDueSoonEmail(service, daysUntilDue) {
  const template = dueSoonEmail({ clientName: service.client.name, serviceName: service.name, amount: service.amount, daysRemaining: daysUntilDue, dueDate: new Date(service.nextDueDate).toLocaleDateString('en-US') });
  return sendEmail({ to: service.client.email, template });
}

async function sendServiceBlockedEmail(service) {
  const template = serviceBlockedEmail({ clientName: service.client.name, serviceName: service.name, amountOwed: service.amount });
  return sendEmail({ to: service.client.email, template });
}

export async function GET(request) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return new Response('Unauthorized', { status: 401 });
  const dryRun = process.env.CRON_DRY_RUN !== 'false';
  const prisma = await getPrisma();
  const services = await prisma.service.findMany({ where: { billingCycle: { not: 'NO_RESTRICTION' }, status: { not: 'BLOCKED' } }, include: { client: true } });
  const actions = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (const service of services) {
    if (!service.nextDueDate) continue;
    const due = new Date(service.nextDueDate); due.setHours(0, 0, 0, 0);
    const daysUntilDue = Math.round((due - today) / 86400000);
    if ([7, 5, 3, 2, 1].includes(daysUntilDue)) {
      actions.push({ type: 'CLIENT_DUE_SOON_EMAIL', serviceId: service.id, daysUntilDue });
      if (!dryRun) { try { await sendDueSoonEmail(service, daysUntilDue); } catch (error) { console.error('Due-soon email failed', service.id, error.message); } }
    }
    if (daysUntilDue === 2) {
      actions.push({ type: 'ADMIN_DUE_SOON_NOTIFICATION', serviceId: service.id });
      if (!dryRun) await logAdminAction('DUE_SOON_ADMIN_ALERT', 'Service', service.id, { daysUntilDue });
    }
    if (daysUntilDue < 0 && service.status !== 'OVERDUE') {
      actions.push({ type: 'MARK_OVERDUE', serviceId: service.id });
      if (!dryRun) { await prisma.service.update({ where: { id: service.id }, data: { status: 'OVERDUE', gracePeriodStartedAt: today } }); await logAdminAction('AUTO_MARK_OVERDUE', 'Service', service.id, { nextDueDate: service.nextDueDate }); }
    }
    if (service.status === 'OVERDUE' && service.gracePeriodStartedAt) {
      const graceStart = new Date(service.gracePeriodStartedAt); graceStart.setHours(0, 0, 0, 0);
      if (Math.round((today - graceStart) / 86400000) >= 3) {
        actions.push({ type: 'AUTO_BLOCK', serviceId: service.id });
        if (!dryRun) { await prisma.service.update({ where: { id: service.id }, data: { status: 'BLOCKED' } }); await logAdminAction('AUTO_BLOCK', 'Service', service.id, {}); try { await sendServiceBlockedEmail(service); } catch (error) { console.error('Blocked email failed', service.id, error.message); } }
      }
    }
  }
  await logAdminAction(dryRun ? 'CRON_DRY_RUN' : 'CRON_LIVE_RUN', 'System', 'daily-billing-check', { actions });
  return Response.json({ dryRun, actionsCount: actions.length, actions });
}