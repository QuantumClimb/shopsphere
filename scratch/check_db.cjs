const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.product.findMany({ select: { name: true, imageUrl: true } });
  console.log(items.slice(0, 5));
}

main().finally(() => prisma.$disconnect());
