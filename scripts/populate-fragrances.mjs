import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Fragrance knowledge base - mapping product names to metadata
const fragranceData = {
  "Afternoon Swim": { brand: "Louis Vuitton", gender: "Unisex", family: "Fresh", concentration: "EDP" },
  "J'adore": { brand: "Dior", gender: "Female", family: "Floral", concentration: "EDP" },
  "Delina La Rosee": { brand: "Parfums de Marly", gender: "Female", family: "Floral", concentration: "EDP" },
  "Because Its You": { brand: "Emporio Armani", gender: "Female", family: "Floral Fruity", concentration: "EDP" },
  "BecauseItsYou": { brand: "Emporio Armani", gender: "Female", family: "Floral Fruity", concentration: "EDP" },
  "Good Girl": { brand: "Carolina Herrera", gender: "Female", family: "Oriental Floral", concentration: "EDP" },
  "GoodGirl": { brand: "Carolina Herrera", gender: "Female", family: "Oriental Floral", concentration: "EDP" },
  "Silver Mountain Water": { brand: "Creed", gender: "Unisex", family: "Fresh", concentration: "EDP" },
  "SilverMountainWater": { brand: "Creed", gender: "Unisex", family: "Fresh", concentration: "EDP" },
  "ManInBlack": { brand: "Bvlgari", gender: "Male", family: "Oriental Spicy", concentration: "EDP" },
  "TobaccoVanille": { brand: "Tom Ford", gender: "Unisex", family: "Oriental Spicy", concentration: "EDP" },
  "Eilish": { brand: "Billie Eilish", gender: "Unisex", family: "Amber Woody", concentration: "EDP" },
  "Man In Black": { brand: "Bvlgari", gender: "Male", family: "Oriental Spicy", concentration: "EDP" },
  "Wanted": { brand: "Azzaro", gender: "Male", family: "Woody Spicy", concentration: "EDT" },
  "Sauvage": { brand: "Dior", gender: "Male", family: "Aromatic Fougere", concentration: "EDT" },
  "Tobacco Vanille": { brand: "Tom Ford", gender: "Unisex", family: "Oriental Spicy", concentration: "EDP" },
  "Ice": { brand: "Sakamichi", gender: "Unisex", family: "Fresh Aquatic", concentration: "EDT" },
  "Pegasus": { brand: "Parfums de Marly", gender: "Male", family: "Oriental Fougere", concentration: "EDP" },
  "Eros": { brand: "Versace", gender: "Male", family: "Aromatic Fougere", concentration: "EDT" },
  "Eilish Gold": { brand: "Billie Eilish", gender: "Unisex", family: "Amber Woody", concentration: "EDP" },
  "Les Sables Roses": { brand: "Louis Vuitton", gender: "Unisex", family: "Floral Woody", concentration: "EDP" },
  "LesSablesRoses": { brand: "Louis Vuitton", gender: "Unisex", family: "Floral Woody", concentration: "EDP" },
  "EilishNo2": { brand: "Billie Eilish", gender: "Unisex", family: "Floral Amber", concentration: "EDP" },
  "HererraShoe": { brand: "Carolina Herrera", gender: "Female", family: "Floral", concentration: "EDP" },
  "SpellOnYou": { brand: "Louis Vuitton", gender: "Unisex", family: "Oriental Floral", concentration: "EDP" },
  "CityofStars": { brand: "Maison Alhambra", gender: "Unisex", family: "Woody Spicy", concentration: "EDP" },
  "StrongerWithYou": { brand: "Emporio Armani", gender: "Male", family: "Amber Fougere", concentration: "EDT" },
  "Eilish No 2": { brand: "Billie Eilish", gender: "Unisex", family: "Floral Amber", concentration: "EDP" },
  "Herrera Shoe": { brand: "Carolina Herrera", gender: "Female", family: "Floral", concentration: "EDP" },
  "Spell On You": { brand: "Louis Vuitton", gender: "Unisex", family: "Oriental Floral", concentration: "EDP" },
  "City of Stars": { brand: "Maison Alhambra", gender: "Unisex", family: "Woody Spicy", concentration: "EDP" },
  "Stronger With You": { brand: "Emporio Armani", gender: "Male", family: "Amber Fougere", concentration: "EDT" },
  "Paradoxe": { brand: "Prada", gender: "Female", family: "Floral Amber", concentration: "EDP" },
  "My Way": { brand: "Giorgio Armani", gender: "Female", family: "Floral", concentration: "EDP" },
  "MyWay": { brand: "Giorgio Armani", gender: "Female", family: "Floral", concentration: "EDP" },
  "TheOne": { brand: "Dolce & Gabbana", gender: "Male", family: "Oriental Spicy", concentration: "EDP" },
  "SoScandal": { brand: "Jean Paul Gaultier", gender: "Female", family: "Floral Fruity", concentration: "EDP" },
  "StrongerWithYouAbsolutely": { brand: "Emporio Armani", gender: "Male", family: "Amber Woody", concentration: "EDP" },
  "CreedMillésime Impérial": { brand: "Creed", gender: "Unisex", family: "Citrus Fresh", concentration: "EDP" },
  "CreedViking": { brand: "Creed", gender: "Male", family: "Aromatic Fougere", concentration: "EDP" },
  "Valentino": { brand: "Valentino", gender: "Female", family: "Floral", concentration: "EDP" },
  "Hawas": { brand: "Rasasi", gender: "Male", family: "Aquatic Fresh", concentration: "EDP" },
  "The One": { brand: "Dolce & Gabbana", gender: "Male", family: "Oriental Spicy", concentration: "EDP" },
  "So Scandal": { brand: "Jean Paul Gaultier", gender: "Female", family: "Floral Fruity", concentration: "EDP" },
  "Stronger With You Absolutely": { brand: "Emporio Armani", gender: "Male", family: "Amber Woody", concentration: "EDP" },
  "Creed Millesime Imperial": { brand: "Creed", gender: "Unisex", family: "Citrus Fresh", concentration: "EDP" },
  "Creed Viking": { brand: "Creed", gender: "Male", family: "Aromatic Fougere", concentration: "EDP" },
  "Daisy": { brand: "Marc Jacobs", gender: "Female", family: "Floral Fruity", concentration: "EDT" },
  "Guilty": { brand: "Gucci", gender: "Female", family: "Floral Oriental", concentration: "EDP" },
  "Idole": { brand: "Lancome", gender: "Female", family: "Floral", concentration: "EDP" },
  "Valentino Pink": { brand: "Valentino", gender: "Female", family: "Floral Fruity", concentration: "EDP" },
  "ValentinoPink": { brand: "Valentino", gender: "Female", family: "Floral Fruity", concentration: "EDP" },
  "1Million": { brand: "Paco Rabanne", gender: "Male", family: "Woody Spicy", concentration: "EDT" },
  "CoolWater": { brand: "Davidoff", gender: "Male", family: "Aromatic Aquatic", concentration: "EDT" },
  "NeroliPortofino": { brand: "Tom Ford", gender: "Unisex", family: "Citrus Aromatic", concentration: "EDP" },
  "InLoveWithYou": { brand: "Giorgio Armani", gender: "Female", family: "Floral Fruity", concentration: "EDP" },
  "GoodGirlBlush": { brand: "Carolina Herrera", gender: "Female", family: "Floral Fruity", concentration: "EDP" },
  "MYSLF": { brand: "Yves Saint Laurent", gender: "Male", family: "Woody Floral", concentration: "EDP" },
  "1 Million": { brand: "Paco Rabanne", gender: "Male", family: "Woody Spicy", concentration: "EDT" },
  "1888": { brand: "Bvlgari", gender: "Male", family: "Woody Spicy", concentration: "EDT" },
  "Cool Water": { brand: "Davidoff", gender: "Male", family: "Aromatic Aquatic", concentration: "EDT" },
  "Neroli Portofino": { brand: "Tom Ford", gender: "Unisex", family: "Citrus Aromatic", concentration: "EDP" },
  "In Love With You": { brand: "Giorgio Armani", gender: "Female", family: "Floral Fruity", concentration: "EDP" },
  "Good Girl Blush": { brand: "Carolina Herrera", gender: "Female", family: "Floral Fruity", concentration: "EDP" }
};

// Sample descriptions for placeholder data
const sampleDescriptions = {
  "Fresh": "A refreshing and invigorating fragrance that captures the essence of crisp morning air and ocean breezes.",
  "Floral": "An elegant floral bouquet that celebrates femininity with delicate petals and romantic notes.",
  "Oriental Spicy": "A warm and spicy composition that exudes sophistication and mystery.",
  "Woody": "A rich woody fragrance with earthy undertones and masculine character.",
  "Aromatic Fougere": "A classic aromatic blend combining fresh herbs with woody base notes.",
  "Citrus": "A vibrant citrus explosion that energizes and uplifts the senses.",
  "Amber": "A warm amber fragrance with sweet and resinous notes that linger beautifully."
};

// Sample notes for placeholder data
const notesLibrary = {
  "Fresh": {
    top: "Bergamot, Lemon, Mint",
    middle: "Sea Notes, Lavender, Geranium",
    base: "Ambergris, Cedarwood, Musk"
  },
  "Floral": {
    top: "Rose, Jasmine, Peony",
    middle: "Lily of the Valley, Magnolia, Iris",
    base: "Sandalwood, Vanilla, White Musk"
  },
  "Oriental Spicy": {
    top: "Cardamom, Cinnamon, Pink Pepper",
    middle: "Tobacco, Honey, Clove",
    base: "Vanilla, Tonka Bean, Amber"
  },
  "Woody": {
    top: "Bergamot, Cardamom",
    middle: "Cedarwood, Vetiver, Patchouli",
    base: "Oakmoss, Leather, Musk"
  },
  "Aromatic Fougere": {
    top: "Lavender, Bergamot, Basil",
    middle: "Geranium, Coumarin, Sage",
    base: "Vetiver, Oakmoss, Tonka Bean"
  }
};

// Categories to create
const categories = [
  { name: "Men's Fragrances", description: "Sophisticated fragrances for men" },
  { name: "Women's Fragrances", description: "Elegant fragrances for women" },
  { name: "Unisex Fragrances", description: "Versatile fragrances for everyone" }
];

// Price ranges based on brand tier
const priceTiers = {
  luxury: [8000, 12000], // Creed, Tom Ford, Louis Vuitton
  designer: [4000, 7000], // Dior, Armani, Prada, YSL
  premium: [2500, 4000]   // Others
};

function getBrandTier(brand) {
  const luxury = ["Creed", "Tom Ford", "Louis Vuitton", "Parfums de Marly"];
  const designer = ["Dior", "Giorgio Armani", "Emporio Armani", "Prada", "Yves Saint Laurent", "Gucci", "Lancome", "Bvlgari"];
  
  if (luxury.includes(brand)) return "luxury";
  if (designer.includes(brand)) return "designer";
  return "premium";
}

function getRandomPrice(tier) {
  const [min, max] = priceTiers[tier];
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function parseFilename(filename) {
  // Extract product name from format: _####_ProductName.png
  const match = filename.match(/_(\d+)_(.+)\.png$/);
  if (!match) return null;
  
  const [, number, rawName] = match;
  // Replace hyphens and underscores with spaces, handle special cases
  let name = rawName
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Handle special formatting
  name = name
    .replace(/Millesime Imperial/i, 'Millésime Impérial')
    .replace(/No 2/i, 'No.2')
    .replace(/So Scandal/i, 'So Scandal!');
  
  return { number, name };
}

function generateDescription(family, brand, name) {
  const baseDesc = sampleDescriptions[family] || sampleDescriptions["Fresh"];
  return `${name} by ${brand}. ${baseDesc} A luxurious fragrance crafted with premium ingredients, perfect for those who appreciate fine perfumery. Imported and 100% authentic.`;
}

function getNotes(family) {
  // Find the best matching family from our notes library
  for (const key in notesLibrary) {
    if (family.includes(key)) {
      return notesLibrary[key];
    }
  }
  return notesLibrary["Fresh"]; // Default
}

async function populateDatabase() {
  try {
    console.log('🌸 Starting SHOPSPHERE Fragrance Database Population...\n');
    
    // 1. Read fragrance images directory
    const imagesDir = path.join(__dirname, '..', 'public', 'images', 'fragrances');
    const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png'));
    
    console.log(`📁 Found ${files.length} fragrance images\n`);
    
    // 2. Create categories
    console.log('📂 Creating product categories...');
    const createdCategories = {};
    
    for (const cat of categories) {
      // Check if category exists
      let category = await prisma.productCategory.findFirst({
        where: { name: cat.name }
      });
      
      // Create if it doesn't exist
      if (!category) {
        category = await prisma.productCategory.create({
          data: { name: cat.name }
        });
      }
      
      createdCategories[cat.name] = category;
      console.log(`   ✅ ${cat.name} (ID: ${category.id})`);
    }
    
    console.log('\n🌟 Creating fragrance products...\n');
    
    let created = 0;
    let skipped = 0;
    
    // 3. Process each image file
    for (const file of files) {
      const parsed = parseFilename(file);
      if (!parsed) {
        console.log(`   ⚠️  Skipped: ${file} (invalid format)`);
        skipped++;
        continue;
      }
      
      const { number, name } = parsed;
      const metadata = fragranceData[name];
      
      if (!metadata) {
        console.log(`   ⚠️  Skipped: ${name} (no metadata found)`);
        skipped++;
        continue;
      }
      
      // Determine category
      let categoryName;
      if (metadata.gender === "Male") categoryName = "Men's Fragrances";
      else if (metadata.gender === "Female") categoryName = "Women's Fragrances";
      else categoryName = "Unisex Fragrances";
      
      const category = createdCategories[categoryName];
      
      // Generate product data
      const tier = getBrandTier(metadata.brand);
      const price = getRandomPrice(tier);
      const volume = metadata.concentration === "EDT" ? 100 : 50; // EDT typically larger bottles
      const notes = getNotes(metadata.family);
      const description = generateDescription(metadata.family, metadata.brand, name);
      
      // Create product
      try {
        const product = await prisma.product.create({
          data: {
            name: name,
            description: description,
            price: price,
            brand: metadata.brand,
            volume: volume,
            concentration: metadata.concentration,
            gender: metadata.gender,
            fragranceFamily: metadata.family,
            topNotes: notes.top,
            middleNotes: notes.middle,
            baseNotes: notes.base,
            stockQuantity: 10,
            inStock: true,
            imageUrl: `/images/fragrances/${file}`,
            categoryId: category.id
          }
        });
        
        console.log(`   ✅ ${name} (${metadata.brand}) - ₹${price} | ${volume}ml ${metadata.concentration}`);
        created++;
      } catch (error) {
        console.log(`   ❌ Failed to create ${name}: ${error.message}`);
        skipped++;
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 POPULATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully created: ${created} products`);
    console.log(`⚠️  Skipped: ${skipped} items`);
    console.log(`📂 Categories: ${Object.keys(createdCategories).length}`);
    console.log('='.repeat(70));
    
    // 4. Show sample data
    console.log('\n🔍 Sample Products:');
    const samples = await prisma.product.findMany({
      take: 5,
      include: { category: true },
      orderBy: { price: 'desc' }
    });
    
    samples.forEach(p => {
      console.log(`   • ${p.name} (${p.brand}) - ₹${p.price} | ${p.category.name}`);
    });
    
    console.log('\n✅ Database population completed successfully!');
    console.log('🎉 SHOPSPHERE is ready for business!\n');
    
  } catch (error) {
    console.error('❌ Population failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

populateDatabase();
