import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Starting database purge...');

  try {
    // Delete in order to respect foreign key constraints
    
    console.log('Cleaning Order table...');
    await prisma.order.deleteMany({});
    
    console.log('Cleaning Product table...');
    await prisma.product.deleteMany({});
    
    console.log('Cleaning MasterFragrance table...');
    await prisma.masterFragrance.deleteMany({});
    
    console.log('Cleaning Customer table...');
    await prisma.customer.deleteMany({});
    
    console.log('Cleaning ProductCategory table...');
    await prisma.productCategory.deleteMany({});
    
    // Optional: Keep StoreStatus as it's just one row usually
    // console.log('Cleaning StoreStatus table...');
    // await prisma.storeStatus.deleteMany({});

    console.log('✅ Database purge complete!');
  } catch (error) {
    console.error('❌ Error during database purge:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
