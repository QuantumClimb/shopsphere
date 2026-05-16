import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fragrances = [
  {
    name: "Lost Cherry",
    brand: "Tom Ford",
    description: "A full-bodied journey into the once-forbidden; a contrasting scent that reveals a tempting dichotomy of playful, candy-like gleam on the outside and luscious flesh on the inside.",
    price: 350,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Amber Floral",
    category: "Tom Ford Private Blend",
    imageUrl: "https://sdcdn.io/tf/tf_sku_T6LN01_2000x2000_0.png"
  },
  {
    name: "California Dream",
    brand: "Louis Vuitton",
    description: "The sunset in a bottle. A citrusy and warm fragrance that captures the magic of a California evening.",
    price: 320,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Citrus",
    category: "Louis Vuitton Exclusive",
    imageUrl: "https://in.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton-california-dream--LP0175_PM2_Front%20view.jpg"
  },
  {
    name: "Bottled Unlimited (Gold Standard)",
    brand: "Hugo Boss",
    description: "An invigorating blend of freshness, enduring energy and aromatic masculinity. It provides a motivating energy boost for personal success.",
    price: 120,
    volume: 100,
    concentration: "Eau de Toilette",
    gender: "Male",
    fragranceFamily: "Aromatic Fougere",
    category: "Designer Fragrances",
    imageUrl: "https://fimgs.net/photogram/p180/yb/2d/LIp08wIEZPwvju2X.jpg"
  },
  {
    name: "Mon Paris",
    brand: "YSL",
    description: "A sparkling fragrance inspired by Paris, the city of intense love. Red berries and pear immediately exude sensuality and femininity.",
    price: 160,
    volume: 90,
    concentration: "Eau de Parfum",
    gender: "Female",
    fragranceFamily: "Chypre Fruity",
    category: "Designer Fragrances",
    imageUrl: "https://ssbimages.ssbeauty.in/pub/media/catalog/product/images/S17YSL0561634OR/S17YSL0561634OR_base.jpg"
  },
  {
    name: "Flora Gorgeous Gardenia",
    brand: "Gucci",
    description: "A joyful floral signature, the scent is built around the Gardenia flower, admired since the dawn of time for its splendour.",
    price: 180,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Female",
    fragranceFamily: "Floral",
    category: "Designer Fragrances",
    imageUrl: "https://fimgs.net/mdimg/perfume/o.14395.jpg"
  },
  {
    name: "Bombshell",
    brand: "Victoria's Secret",
    description: "The #1 fragrance in America. Confidence and glamour in a bottle. Purple passion fruit, Shangri-la peony and vanilla orchid.",
    price: 95,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Female",
    fragranceFamily: "Floral Fruity",
    category: "Luxury Collection",
    imageUrl: "https://www.victoriassecret.in/on/demandware.static/-/Sites-vs_master_catalog/default/dwde2e49c9/large/112542122457_OM_F.jpg"
  },
  {
    name: "Lady Million",
    brand: "Paco Rabanne",
    description: "Diamond-like and feminine. A fragrance for the woman who shines, who is assertive and always glamorous.",
    price: 110,
    volume: 80,
    concentration: "Eau de Parfum",
    gender: "Female",
    fragranceFamily: "Floral Woody",
    category: "Designer Fragrances",
    imageUrl: "https://m.media-amazon.com/images/I/714qI0eYEAL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    name: "Acqua Di Gio",
    brand: "Giorgio Armani",
    description: "A classic aquatic fragrance that captures the essence of the Mediterranean sea. Fresh, clean, and timeless.",
    price: 130,
    volume: 100,
    concentration: "Eau de Toilette",
    gender: "Male",
    fragranceFamily: "Aromatic Aquatic",
    category: "Designer Fragrances",
    imageUrl: "https://momperfumes.in/cdn/shop/products/GIORGIOARMANIACQUADI-GIOEDPFORMEN1_1.jpg"
  },
  {
    name: "Silver Mountain Water",
    brand: "Creed",
    description: "Inspired by the exhilarating crispness of mountain air and the purity of cascading alpine streams.",
    price: 430,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Aromatic",
    category: "Niche & Artisanal",
    imageUrl: "/images/fragrances/_0005_SilverMountainWater.png"
  },
  {
    name: "Flora Gorgeous Jasmine",
    brand: "Gucci",
    description: "Bursting with a radiant composition led by Grandiflorum Jasmine. It’s a scent of uninhibited freedom.",
    price: 180,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Female",
    fragranceFamily: "Floral",
    category: "Designer Fragrances",
    imageUrl: "https://www.parcos.com/_next/image?url=https%3A%2F%2Fprod.parcoscom.hyperx.cloud%2Fmedia%2Fcatalog%2Fproduct%2F3%2F6%2F3616303048181_1_2.webp&w=1920&q=75"
  },
  {
    name: "Bleu De Chanel",
    brand: "Chanel",
    description: "A tribute to masculine freedom in an aromatic-woody fragrance with a captivating trail. A timeless, powerful scent.",
    price: 150,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Male",
    fragranceFamily: "Aromatic Woody",
    category: "Designer Fragrances",
    imageUrl: "https://fimgs.net/mdimg/perfume/o.9099.jpg"
  },
  {
    name: "Tam Dao",
    brand: "Diptyque",
    description: "A memory from Indochina. A woody, velvety, and creamy scent of sandalwood. Pure and serene.",
    price: 210,
    volume: 75,
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Woody",
    category: "Niche & Artisanal",
    imageUrl: "https://momperfume.in/cdn/shop/files/tam-dao_face_tamdaop75_1439x1200-e1662947912777_143d5a65-70e4-4f5d-9570-d7f2ffd6273a.png?v=1720103989"
  },
  {
    name: "Bitter Peach",
    brand: "Tom Ford",
    description: "P\u00eache de Vigne and Sicilian Blood Orange oil release the slick sweetness of a bitter peach at its luscious peak.",
    price: 390,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Amber Vanilla",
    category: "Tom Ford Private Blend",
    imageUrl: "https://scentira.in/cdn/shop/files/TOM_FORD_BRIGHT_PEACH_1_23004dfd-1f3e-4b63-906e-4d672d045af9.png?v=1756889299&width=1000"
  },
  {
    name: "Electric Cherry",
    brand: "Tom Ford",
    description: "Electric Cherry merges the lush tartness of Morello cherry notes with exhilarating ginger and opulent jasmine.",
    price: 390,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Floral Fruity",
    category: "Tom Ford Private Blend",
    imageUrl: "https://sdcdn.io/tf/tf_sku_TCRN01_2000x2000_0.png"
  },
  {
    name: "Coco Mademoiselle",
    brand: "Chanel",
    description: "The essence of a free and bold woman. A feminine oriental with a strong personality and a surprising freshness.",
    price: 170,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Female",
    fragranceFamily: "Amber Floral",
    category: "Designer Fragrances",
    imageUrl: "https://www.chanel.com/puls-img/1600000000000/onepdpeditopushdesktopmobile01974x1298px4jpg_1298x974.jpg"
  },
  {
    name: "Touch for Men",
    brand: "Burberry",
    description: "A clean, refreshing fragrance with top notes of artemisia, mandarin tree and violet leaves.",
    price: 85,
    volume: 100,
    concentration: "Eau de Toilette",
    gender: "Male",
    fragranceFamily: "Woody Floral Musk",
    category: "Designer Fragrances",
    imageUrl: "https://m.media-amazon.com/images/I/61M6X0Qf6LL._AC_SL1500_.jpg"
  },
  {
    name: "On the Beach",
    brand: "Louis Vuitton",
    description: "Ecstasy of the sun, the rhythm of the sea and the gentle warmth of sand on the skin. A bright and solar fragrance.",
    price: 320,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Citrus Aromatic",
    category: "Louis Vuitton Exclusive",
    imageUrl: "https://in.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton-on-the-beach--LP0226_PM2_Front%20view.jpg"
  },
  {
    name: "Fleur Musc",
    brand: "Narciso Rodriguez",
    description: "A vibrant and dazzling bouquet of roses and pink peppercorns. A spirit of independence and grace.",
    price: 140,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Female",
    fragranceFamily: "Floral Woody Musk",
    category: "Designer Fragrances",
    imageUrl: "https://fimgs.net/mdimg/perfume/o.42460.jpg"
  },
  {
    name: "Because It's You",
    brand: "Emporio Armani",
    description: "A happy, delicious and sparkling perfume for women: simply irresistible like a ripe raspberry.",
    price: 115,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Female",
    fragranceFamily: "Floral Fruity",
    category: "Designer Fragrances",
    imageUrl: "/images/fragrances/_0003_BecauseItsYou.png"
  },
  {
    name: "Pacific Chill",
    brand: "Louis Vuitton",
    description: "A wellness-inspiring fragrance that captures the energy of the ocean and the cooling effect of the wind.",
    price: 320,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Aromatic Fruity",
    category: "Louis Vuitton Exclusive",
    imageUrl: "https://in.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton-pacific-chill--LP0326_PM2_Front%20view.jpg"
  },
  {
    name: "Ombre Nomade",
    brand: "Louis Vuitton",
    description: "A fragrance for connoisseurs. A vortex of oud wood, incense and raspberry. Pure luxury and depth.",
    price: 450,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Amber Woody",
    category: "Louis Vuitton Exclusive",
    imageUrl: "https://in.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton-ombre-nomade--LP0095_PM2_Front%20view.jpg"
  },
  {
    name: "Vanilla Sex",
    brand: "Tom Ford",
    description: "An addictive, amber vanilla fragrance that is both pure and provocative. A new standard of vanilla.",
    price: 390,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Amber Vanilla",
    category: "Tom Ford Private Blend",
    imageUrl: "https://fimgs.net/mdimg/perfume/o.1000.jpg"
  },
  {
    name: "Les Sables Roses",
    brand: "Louis Vuitton",
    description: "A tribute to the rose and the desert. A timeless fragrance that combines rose, oud and ambergris.",
    price: 450,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Amber Floral",
    category: "Louis Vuitton Exclusive",
    imageUrl: "/images/fragrances/_0015_LesSablesRoses.png"
  },
  {
    name: "Kyoto",
    brand: "Diptyque",
    description: "A journey to the heart of Japan. A floral and woody scent that balances tradition and modernity.",
    price: 230,
    volume: 100,
    concentration: "Eau de Toilette",
    gender: "Unisex",
    fragranceFamily: "Floral Woody",
    category: "Niche & Artisanal",
    imageUrl: "https://fimgs.net/mdimg/perfume/o.66266.jpg"
  },
  {
    name: "1 Million",
    brand: "Paco Rabanne",
    description: "The expression of every man's fantasies. A taste for money, sparkling cars, games and pretty girls.",
    price: 110,
    volume: 100,
    concentration: "Eau de Toilette",
    gender: "Male",
    fragranceFamily: "Woody Spicy",
    category: "Designer Fragrances",
    imageUrl: "/images/fragrances/_0035_1Million.png"
  },
  {
    name: "City of Stars",
    brand: "Louis Vuitton",
    description: "A night in Los Angeles. A citrusy and festive fragrance that captures the sparkle of the city lights.",
    price: 320,
    volume: 100,
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Citrus",
    category: "Louis Vuitton Exclusive",
    imageUrl: "/images/fragrances/_0019_CityofStars.png"
  },
  {
    name: "Black Opium",
    brand: "YSL",
    description: "The first floral coffee. A shot of adrenaline, energy and addiction. For the woman who lives with passion.",
    price: 155,
    volume: 90,
    concentration: "Eau de Parfum",
    gender: "Female",
    fragranceFamily: "Amber Vanilla",
    category: "Designer Fragrances",
    imageUrl: "https://ssbimages.ssbeauty.in/pub/media/catalog/product/3/6/3614270561634_1.jpg"
  },
  {
    name: "Guilty Pour Femme Intense (Maroon)",
    brand: "Gucci",
    description: "A floral woody fragrance for women. Mandora and Lychee are used to give a modern feel to the floral notes.",
    price: 185,
    volume: 90,
    concentration: "Eau de Parfum",
    gender: "Female",
    fragranceFamily: "Amber Floral",
    category: "Designer Fragrances",
    imageUrl: "https://fimgs.net/mdimg/perfume/o.58880.jpg"
  }
];

async function main() {
  console.log('🌸 Starting LUXURY LINE Database Population...');

  try {
    // 1. Create categories
    const categoryNames = [...new Set(fragrances.map(f => f.category))];
    const categoryMap = {};

    for (const name of categoryNames) {
      const category = await prisma.productCategory.create({
        data: { name }
      });
      categoryMap[name] = category.id;
      console.log(`✅ Created category: ${name}`);
    }

    // 2. Create Master Fragrances and Products
    for (const f of fragrances) {
      const masterFragrance = await prisma.masterFragrance.create({
        data: {
          name: f.name,
          brand: f.brand,
          description: f.description,
          price: f.price,
          volume: f.volume,
          concentration: f.concentration,
          gender: f.gender,
          fragranceFamily: f.fragranceFamily,
          categoryId: categoryMap[f.category],
          imageUrl: f.imageUrl,
          // We don't store base64 data to keep Neon DB small
        }
      });

      await prisma.product.create({
        data: {
          name: f.name,
          description: f.description,
          price: f.price,
          brand: f.brand,
          volume: f.volume,
          concentration: f.concentration,
          gender: f.gender,
          fragranceFamily: f.fragranceFamily,
          categoryId: categoryMap[f.category],
          imageUrl: f.imageUrl,
          masterFragranceId: masterFragrance.id,
          stockQuantity: 50,
          inStock: true
        }
      });

      console.log(`✅ Populated: ${f.brand} ${f.name}`);
    }

    console.log('🎉 LUXURY LINE is ready for business!');
  } catch (error) {
    console.error('❌ Error during population:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
