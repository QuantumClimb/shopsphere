const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up Product table...');
  await prisma.product.deleteMany();
  console.log('Product table cleared.');

  console.log('Activating all master fragrances to live shop...');

  const allMasters = await prisma.masterFragrance.findMany();

  console.log(`Found ${allMasters.length} master fragrances to activate.`);

  for (const mf of allMasters) {
    console.log(`Activating ${mf.brand} ${mf.name} (MF ID: ${mf.id})...`);

    await prisma.product.create({
      data: {
        name: mf.name,
        brand: mf.brand,
        description: mf.description || '',
        price: mf.price || 0,
        volume: mf.volume,
        concentration: mf.concentration,
        gender: mf.gender,
        categoryId: mf.categoryId,
        imageData: mf.imageData,
        imageMimeType: mf.imageMimeType,
        imageSize: mf.imageSize,
        inStock: true,
        stockQuantity: 10,
        masterFragranceId: mf.id
      }
    });
  }

  console.log(`Activation complete! ${allMasters.length} items are now available in the shop.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
