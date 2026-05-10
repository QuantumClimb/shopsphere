import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function updateInventory() {
  try {
    console.log('🚀 Starting Inventory Update...');

    // 1. Load matched perfumes
    const matchedPath = path.join(__dirname, '..', 'matched_perfumes.json');
    if (!fs.existsSync(matchedPath)) {
      console.error('❌ matched_perfumes.json not found. Run match_perfumes.py first.');
      return;
    }
    const perfumes = JSON.parse(fs.readFileSync(matchedPath, 'utf8'));
    console.log(`📊 Loaded ${perfumes.length} matched perfumes.`);

    // 2. Clear existing products and categories
    console.log('🧹 Clearing existing inventory...');
    await prisma.product.deleteMany({});
    await prisma.productCategory.deleteMany({});

    // 3. Create categories
    console.log('📂 Creating categories...');
    const categoryNames = ["Men's Fragrances", "Women's Fragrances", "Unisex Fragrances"];
    const categories = {};
    
    for (const name of categoryNames) {
      const cat = await prisma.productCategory.create({
        data: { name }
      });
      categories[name] = cat.id;
    }

    // 4. Insert new perfumes
    console.log('✨ Inserting new perfumes...');
    let inserted = 0;

    for (const p of perfumes) {
      // Determine category ID
      const catId = categories[`${p.gender}'s Fragrances`] || categories["Unisex Fragrances"];

      // Assign price based on brand tier
      const luxuryBrands = ["Creed", "Tom Ford", "Louis Vuitton", "Parfums de Marly"];
      const designerBrands = ["Dior", "Giorgio Armani", "Emporio Armani", "Prada", "Yves Saint Laurent", "Gucci", "Lancome", "Bvlgari"];
      
      let price = 3500; // Base price
      if (luxuryBrands.includes(p.matched_brand)) price = 9500 + Math.floor(Math.random() * 2000);
      else if (designerBrands.includes(p.matched_brand)) price = 5500 + Math.floor(Math.random() * 1500);
      else price = 2500 + Math.floor(Math.random() * 1000);

      try {
        await prisma.product.create({
          data: {
            name: p.matched_name,
            brand: p.matched_brand,
            description: `${p.matched_name} by ${p.matched_brand}. A sophisticated fragrance featuring ${p.family || 'exquisite'} notes.`,
            price: price,
            volume: p.volume || 100,
            concentration: p.concentration || 'EDP',
            gender: p.gender,
            fragranceFamily: p.family,
            topNotes: p.top_notes,
            middleNotes: p.middle_notes,
            baseNotes: p.base_notes,
            stockQuantity: 10,
            inStock: true,
            imageUrl: `/extracted_pdf_data/${p.image}`,
            categoryId: catId
          }
        });
        inserted++;
      } catch (err) {
        console.error(`❌ Failed to insert ${p.matched_name}:`, err.message);
      }
    }

    console.log(`✅ Inventory update complete. Inserted ${inserted} products.`);

  } catch (error) {
    console.error('❌ Inventory update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateInventory();
