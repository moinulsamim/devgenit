import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../../lib/prisma';
import { requireAdmin, unauthorized } from '../../../../../lib/admin-api';

export async function GET() {
  if (!await requireAdmin()) return unauthorized();
  const prisma = await getPrisma();
  const count = await prisma.paymentClaim.count({ where: { status: 'PENDING' } });
  return NextResponse.json({ count });
}