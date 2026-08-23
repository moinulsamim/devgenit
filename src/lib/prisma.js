const globalForPrisma = globalThis;

export async function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    throw new Error('DATABASE_URL is not set; cannot initialize Prisma client');
  }
  const { PrismaClient } = await import('../generated/prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const adapter = new PrismaPg({ connectionString: conn });
  const client = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  return client;
}