const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'ProductCategory'`;
    console.log('Columns:', result);
    
    // Also check if we can query categories
    const categories = await prisma.productCategory.findMany();
    console.log('Categories:', categories);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
