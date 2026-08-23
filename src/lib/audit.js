import { getPrisma } from './prisma';

export async function logAdminAction(action, targetType, targetId, details = null, client = null) {
  const prisma = client || await getPrisma();
  await prisma.adminAuditLog.create({
    data: { action, targetType, targetId, details },
  });
}