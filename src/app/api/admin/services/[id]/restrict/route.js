import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../../../lib/prisma';
import { logAdminAction } from '../../../../../../lib/audit';
import { requireAdmin, unauthorized } from '../../../../../../lib/admin-api';

export async function POST(request, { params }) {
  if (!await requireAdmin()) return unauthorized();
  const { id } = await params;
  const prisma = await getPrisma();
  const before = await prisma.service.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  const service = await prisma.service.update({ where: { id }, data: { status: 'BLOCKED' } });
  await logAdminAction('RESTRICT_SERVICE', 'Service', id, { beforeStatus: before.status, afterStatus: service.status });
  return NextResponse.json(service);
}