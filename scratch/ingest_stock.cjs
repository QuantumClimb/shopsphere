const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const STOCK_DIR = path.join(__dirname, '..', 'public', 'stock');

const fragranceData = [
  { fileName: 'IMG_20260515_133550.jpg', name: 'Afternoon Swim', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Unisex', categoryId: 9 },
  { fileName: 'IMG_20260515_133619.jpg', name: 'Pacific Chill', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Unisex', categoryId: 9 },
  { fileName: 'IMG_20260515_133633.jpg', name: 'California Dream', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Unisex', categoryId: 9 },
  { fileName: 'IMG_20260515_133645.jpg', name: 'On The Beach', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Unisex', categoryId: 9 },
  { fileName: 'IMG_20260515_133700.jpg', name: 'Symphony', brand: 'Louis Vuitton', price: 450.00, volume: 100, concentration: 'Extrait de Parfum', gender: 'Unisex', categoryId: 9 },
  { fileName: 'IMG_20260515_133713.jpg', name: 'Matière Noire', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Women', categoryId: 8 },
  { fileName: 'IMG_20260515_133730.jpg', name: 'Spell On You', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Women', categoryId: 8 },
  { fileName: 'IMG_20260515_133740.jpg', name: 'Dans La Peau', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Women', categoryId: 8 },
  { fileName: 'IMG_20260515_133755.jpg', name: 'L\'Immensité', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Men', categoryId: 7 },
  { fileName: 'IMG_20260515_133808.jpg', name: 'Orage', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Men', categoryId: 7 },
  { fileName: 'IMG_20260515_133819.jpg', name: 'Rose Des Vents', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Women', categoryId: 8 },
  { fileName: 'IMG_20260515_133831.jpg', name: 'Coeur Battant', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Women', categoryId: 8 },
  { fileName: 'IMG_20260515_133841.jpg', name: 'Nouveau Monde', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Men', categoryId: 7 },
  { fileName: 'IMG_20260515_133851.jpg', name: 'Météore', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Men', categoryId: 7 },
  { fileName: 'IMG_20260515_133901.jpg', name: 'Au Hasard', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Men', categoryId: 7 },
  { fileName: 'IMG_20260515_133912.jpg', name: 'Sur La Route', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Men', categoryId: 7 },
  { fileName: 'IMG_20260515_133925.jpg', name: 'Heures D\'Absence', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Women', categoryId: 8 },
  { fileName: 'IMG_20260515_133936.jpg', name: 'Cactus Garden', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Unisex', categoryId: 9 },
  { fileName: 'IMG_20260515_133949.jpg', name: 'Sun Song', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Unisex', categoryId: 9 },
  { fileName: 'IMG_20260515_134000.jpg', name: 'Mille Feux', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Women', categoryId: 8 },
  { fileName: 'IMG_20260515_134011.jpg', name: 'Apogée', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Women', categoryId: 8 },
  { fileName: 'IMG_20260515_134022.jpg', name: 'Contre Moi', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Women', categoryId: 8 },
  { fileName: 'IMG_20260515_134041.jpg', name: 'Le Jour Se Lève', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Women', categoryId: 8 },
  { fileName: 'IMG_20260515_134051.jpg', name: 'Turbulences', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Women', categoryId: 8 },
  { fileName: 'IMG_20260515_134105.jpg', name: 'Nuit de Feu', brand: 'Louis Vuitton', price: 320.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Unisex', categoryId: 9 },
  { fileName: 'IMG_20260515_134122.jpg', name: 'Ombre Nomade', brand: 'Louis Vuitton', price: 320.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Unisex', categoryId: 9 },
  { fileName: 'IMG_20260515_134128.jpg', name: 'Attrape-Rêves', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Women', categoryId: 8 },
  { fileName: 'IMG_20260515_134159.jpg', name: 'Vanilla Sex', brand: 'Tom Ford', price: 320.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Unisex', categoryId: 9 },
  { fileName: 'IMG_20260515_134214.jpg', name: 'Les Sables Roses', brand: 'Louis Vuitton', price: 320.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Unisex', categoryId: 9 },
  { fileName: 'IMG_20260515_134228.jpg', name: 'Kyoto', brand: 'Diptyque', price: 140.00, volume: 100, concentration: 'Eau de Toilette', gender: 'Unisex', categoryId: 9 },
  { fileName: 'IMG_20260515_134243.jpg', name: '1 Million', brand: 'Paco Rabanne', price: 80.00, volume: 100, concentration: 'Eau de Toilette', gender: 'Men', categoryId: 7 },
  { fileName: 'IMG_20260515_134301.jpg', name: 'City of Stars', brand: 'Louis Vuitton', price: 255.00, volume: 100, concentration: 'Eau de Parfum', gender: 'Unisex', categoryId: 9 },
  { fileName: 'IMG_20260515_134310.jpg', name: 'Black Opium', brand: 'Yves Saint Laurent', price: 110.00, volume: 90, concentration: 'Eau de Parfum', gender: 'Women', categoryId: 8 },
  { fileName: 'IMG_20260515_134319.jpg', name: 'Guilty', brand: 'Gucci', price: 95.00, volume: 90, concentration: 'Eau de Parfum', gender: 'Women', categoryId: 8 }
];

async function main() {
  console.log('Starting ingestion of 34 fragrances...');

  // Clear existing master fragrances to avoid duplicates
  await prisma.masterFragrance.deleteMany({});
  console.log('Cleared existing master fragrances.');

  for (const item of fragranceData) {
    const filePath = path.join(STOCK_DIR, item.fileName);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    const imageBuffer = fs.readFileSync(filePath);
    const imageData = imageBuffer.toString('base64');
    const imageMimeType = 'image/jpeg';
    const imageSize = imageBuffer.length;

    console.log(`Ingesting ${item.brand} ${item.name}...`);

    await prisma.masterFragrance.create({
      data: {
        name: item.name,
        brand: item.brand,
        price: item.price,
        volume: item.volume,
        concentration: item.concentration,
        gender: item.gender,
        categoryId: item.categoryId,
        imageData: imageData,
        imageMimeType: imageMimeType,
        imageSize: imageSize,
        description: `${item.brand} ${item.name} ${item.concentration} for ${item.gender}.`
      }
    });
  }

  console.log('Ingestion complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
