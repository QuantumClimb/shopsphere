const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting migration of products to repository...');
  
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products to move.`);

  for (const product of products) {
    console.log(`Processing: ${product.name}`);
    
    // Create master fragrance
    const master = await prisma.masterFragrance.create({
      data: {
        name: product.name,
        brand: product.brand,
        description: product.description,
        price: product.price,
        volume: product.volume,
        concentration: product.concentration,
        gender: product.gender,
        fragranceFamily: product.fragranceFamily,
        topNotes: product.topNotes,
        middleNotes: product.middleNotes,
        baseNotes: product.baseNotes,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
        imageData: product.imageData,
        imageMimeType: product.imageMimeType,
        imageSize: product.imageSize
      }
    });

    console.log(`Created master for: ${product.name} (ID: ${master.id})`);
  }

  // Now delete all live products so the shop is empty as requested
  const deleteResult = await prisma.product.deleteMany({});
  console.log(`Deleted ${deleteResult.count} live products. Shop is now empty.`);
  
  console.log('✅ Migration complete!');
}

main()
  .catch(e => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
