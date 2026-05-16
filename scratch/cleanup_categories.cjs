const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.productCategory.findMany();
  const seen = new Map();
  
  for (const cat of cats) {
    if (seen.has(cat.name)) {
      const originalId = seen.get(cat.name);
      // Move products to the original category
      await prisma.product.updateMany({
        where: { categoryId: cat.id },
        data: { categoryId: originalId }
      });
      // Delete the duplicate
      await prisma.productCategory.delete({
        where: { id: cat.id }
      });
      console.log(`Deleted duplicate category: ${cat.name} (id: ${cat.id})`);
    } else {
      seen.set(cat.name, cat.id);
    }
  }
  console.log('Cleanup complete.');
}

main()
  .catch(e => console.error(error))
  .finally(async () => {
    await prisma.$disconnect();
  });
