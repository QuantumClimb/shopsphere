const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    "Men's Fragrances",
    "Women's Fragrances",
    "Unisex Fragrances"
  ];

  for (const name of categories) {
    await prisma.productCategory.upsert({
      where: { id: categories.indexOf(name) + 1 }, // This is a bit brittle but okay for a one-off
      update: { name },
      create: { name }
    });
  }
  
  console.log('Categories seeded.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
