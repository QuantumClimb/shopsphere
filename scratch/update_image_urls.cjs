const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating product image URLs to point to database image endpoint...');

  const products = await prisma.product.findMany({
    where: {
      imageData: { not: null }
    }
  });

  console.log(`Found ${products.length} products with image data.`);

  for (const product of products) {
    const imageUrl = `/api/images/${product.id}`;
    console.log(`Updating ${product.name} with image URL: ${imageUrl}`);
    
    await prisma.product.update({
      where: { id: product.id },
      data: { imageUrl: imageUrl }
    });
  }

  // Also update MasterFragrance for future clones
  const mfs = await prisma.masterFragrance.findMany({
    where: {
      imageData: { not: null }
    }
  });

  console.log(`Found ${mfs.length} master fragrances with image data.`);

  for (const mf of mfs) {
    // Note: MasterFragrance doesn't have an image serving endpoint yet in index.js, 
    // but we can add one or just use the Product one if they were the same.
    // Actually, the Product ID and MF ID are different.
    // Let's add an endpoint for MF images too or just let it be for now.
    // The Product one is more important for the live shop.
  }

  console.log('Update complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
