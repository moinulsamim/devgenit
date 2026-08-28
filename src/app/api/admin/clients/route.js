import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../lib/prisma';
import { hashPassword } from '../../../../lib/auth';
import { logAdminAction } from '../../../../lib/audit';
import { badRequest, readJson, requireAdmin, unauthorized } from '../../../../lib/admin-api';

export async function GET() {
  if (!await requireAdmin()) return unauthorized();
  const prisma = await getPrisma();
  const clients = await prisma.client.findMany({
    include: {
      services: {
        include: {
          payments: true,
          paymentClaims: { where: { status: 'PENDING' } },
        },
      },
    },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(clients);
}

export async function POST(request) {
  if (!await requireAdmin()) return unauthorized();
  const body = await readJson(request);
  const { name, company, email, phone, loginUsername, password } = body || {};
  if (!name || !email || !loginUsername || !password) return badRequest('name, email, loginUsername, and password are required');
  if (password.length < 8) return badRequest('Password must be at least 8 characters');
  const prisma = await getPrisma();
  try {
    const client = await prisma.client.create({ data: { name, company: company || null, email, phone: phone || null, loginUsername, passwordHash: await hashPassword(password) } });
    await logAdminAction('CREATE_CLIENT', 'Client', client.id, { email: client.email, loginUsername: client.loginUsername });
    return NextResponse.json({ id: client.id, name: client.name, email: client.email, loginUsername: client.loginUsername }, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Email or login username is already in use' }, { status: 409 });
    return NextResponse.json({ error: 'Unable to create client' }, { status: 500 });
  }
}