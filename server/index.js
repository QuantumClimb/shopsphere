// server/index.js - Express API server for Luxury Line (LUXURY LINE)
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const prisma = new PrismaClient({
  log: ['warn', 'error']
});

// Luxury Line contact info
const RESTAURANT_WHATSAPP = process.env.RESTAURANT_WHATSAPP || '+351920617185';
const RESTAURANT_EMAIL = process.env.RESTAURANT_EMAIL || 'support@luxury-line.app';

// RESEND TEST MODE: Send all emails to account owner until domain is verified
// Set to true to test email flow, false for production with verified domain
const RESEND_TEST_MODE = process.env.RESEND_TEST_MODE === 'true' || true; // Default to test mode
const RESEND_TEST_EMAIL = 'juncando@gmail.com'; // Resend account owner email

// Initialize Resend (for email notifications) - DISABLED
let resend = null;
// if (process.env.RESEND_API_KEY) {
//   try {
//     resend = new Resend(process.env.RESEND_API_KEY);
//     console.log('✅ Resend initialized for email notifications');
//     if (RESEND_TEST_MODE) {
//       console.log('⚠️  RESEND TEST MODE: All emails will be sent to', RESEND_TEST_EMAIL);
//       console.log('   Set RESEND_TEST_MODE=false after verifying domain');
//     }
//   } catch (error) {
//     console.warn('⚠️  Resend initialization failed:', error.message);
//   }
// } else {
  console.warn('⚠️  Resend disabled - email notifications will not work');
// }

// Initialize Twilio (for WhatsApp notifications)
let twilioClient = null;
const TWILIO_ENABLED = process.env.TWILIO_ENABLED === 'true';
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

if (TWILIO_ENABLED && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio initialized for WhatsApp notifications');
    console.log(`   From: ${TWILIO_WHATSAPP_FROM}`);
    console.log(`   To: ${RESTAURANT_WHATSAPP}`);
  } catch (error) {
    console.warn('⚠️  Twilio initialization failed:', error.message);
  }
} else if (TWILIO_ENABLED) {
  console.warn('⚠️  Twilio not configured - WhatsApp notifications will use manual method');
} else {
  console.log('ℹ️  Twilio disabled - using manual WhatsApp links (set TWILIO_ENABLED=true to enable)');
}

const PORT = process.env.PORT || 3001;

// Database connection status with lightweight retry capability
let dbConnected = false;
let lastDbCheck = 0;

// Ensure database connection (used on startup and per-request when needed)
async function ensureDbConnection(force = false) {
  const now = Date.now();
  // Avoid hammering DB: only recheck if forced or 10s have passed
  if (!force && dbConnected && now - lastDbCheck < 10_000) {
    return true;
  }
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
    return true;
  } catch (error) {
    dbConnected = false;
    console.warn('⚠️  Database check failed:', error.message);
    return false;
  } finally {
    lastDbCheck = now;
  }
}

// Configure multer for memory storage (works on Vercel)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP image files are allowed!'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve database-stored images via base64 data URIs
app.get('/api/images/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const { id } = req.params;
    const item = await prisma.product.findUnique({
      where: { id: Number.parseInt(id) },
      select: { imageData: true, imageMimeType: true }
    });

    if (!item || !item.imageData) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Handle both data URI format and raw base64
    let base64Data = item.imageData;
    if (base64Data.startsWith('data:')) {
      // Extract base64 from data URI: data:image/jpeg;base64,/9j/4AAQ...
      const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        base64Data = matches[2];
      }
    }

    // Convert base64 to buffer and send as image
    const imageBuffer = Buffer.from(base64Data, 'base64');
    res.set({
      'Content-Type': item.imageMimeType || 'image/jpeg',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    });
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Global error handler to prevent serverless hard crashes
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  // Trigger a background check but don't block health response
  ensureDbConnection().finally(() => {});
  res.json({
    status: 'OK',
    message: 'Server is running',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Database diagnostics endpoint for quick monitoring
app.get('/api/db/diagnostics', async (req, res) => {
  try {
    const connected = await ensureDbConnection(true);
    if (!connected) {
      return res.status(503).json({ ok: false, reason: 'database-unavailable' });
    }

    const [versionRow] = await prisma.$queryRaw`SELECT version()`;
    const [nowRow] = await prisma.$queryRaw`SELECT NOW()`;
    const [counts] = await prisma.$queryRaw`SELECT 
      (SELECT COUNT(*) FROM "public"."ProductCategory")::int AS categories,
      (SELECT COUNT(*) FROM "public"."Product")::int AS items`;

    res.json({
      ok: true,
      db: {
        connected: true,
        version: versionRow?.version || 'unknown',
        now: nowRow?.now || null,
        counts
      }
    });
  } catch (err) {
    console.error('Diagnostics error:', err);
    res.status(500).json({ ok: false, error: 'diagnostics-failed' });
  }
});

// Get all menu categories with items
app.get('/api/menu', async (req, res) => {
  console.log('📥 GET /api/menu request received');
  try {
    console.log('🔍 Checking database connection...');
    if (!(await ensureDbConnection())) {
      console.log('⚠️  Database not connected, using fallback');
      // Fallback: serve static menu data bundled with the app
      try {
        const fallbackPath = path.join(__dirname, '..', 'public', 'menuData.json');
        if (fs.existsSync(fallbackPath)) {
          const json = fs.readFileSync(fallbackPath, 'utf-8');
          return res.json(JSON.parse(json));
        }
      } catch (e) {
        console.warn('Fallback inventory load failed:', e.message);
      }
      return res.json([]);
    }

    console.log('🔍 Querying ProductCategory...');
    const categories = await prisma.productCategory.findMany({
      include: {
        products: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform to match frontend expectations with database-served images
    const menuData = categories.map(category => ({
      name: category.name,
      items: category.products.map(item => ({
        id: item.id.toString(),
        name: item.name,
        namePt: item.namePt,
        description: item.description,
        descriptionPt: item.descriptionPt,
        price: item.price,
        brand: item.brand,
        volume: item.volume,
        concentration: item.concentration,
        gender: item.gender,
        fragranceFamily: item.fragranceFamily,
        topNotes: item.topNotes,
        middleNotes: item.middleNotes,
        baseNotes: item.baseNotes,
        stockQuantity: item.stockQuantity,
        inStock: item.inStock,
        // Use imageUrl from database (static file path)
        imageUrl: item.imageUrl
      }))
    }));

    res.json(menuData);
  } catch (error) {
    console.error('❌ Error fetching menu:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch menu data' });
  }
});

// Get items by category
app.get('/api/menu/category/:categoryName', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ 
        error: 'Database unavailable',
        message: 'Please try again later or use fallback data'
      });
    }
    const { categoryName } = req.params;
    const category = await prisma.productCategory.findFirst({
      where: {
        name: {
          equals: categoryName,
          mode: 'insensitive'
        }
      },
      include: {
        products: true
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const menuItems = category.products.map(item => ({
      id: item.id.toString(),
      name: item.name,
      namePt: item.namePt,
      description: item.description,
      descriptionPt: item.descriptionPt,
      price: item.price,
      dietary: item.dietary ? item.dietary.split(',').filter(d => d.trim()) : [],
      hasSpiceCustomization: item.hasSpiceCustomization || false,
      // Use imageUrl from database (static file path)
      imageUrl: item.imageUrl,
      brand: item.brand,
      volume: item.volume,
      concentration: item.concentration,
      gender: item.gender,
      fragranceFamily: item.fragranceFamily,
      topNotes: item.topNotes,
      middleNotes: item.middleNotes,
      baseNotes: item.baseNotes,
      stockQuantity: item.stockQuantity,
      inStock: item.inStock
    }));

    res.json({
      category: category.name,
      items: menuItems
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category data' });
  }
});

// Serve images from database
app.get('/api/images/product/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) return res.status(503).end();
    const product = await prisma.product.findUnique({
      where: { id: Number.parseInt(req.params.id) },
      select: { imageData: true, imageMimeType: true }
    });
    if (!product || !product.imageData) return res.status(404).end();
    
    const buffer = Buffer.from(product.imageData, 'base64');
    res.setHeader('Content-Type', product.imageMimeType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(buffer);
  } catch (err) {
    res.status(500).end();
  }
});

app.get('/api/images/master/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) return res.status(503).end();
    const mf = await prisma.masterFragrance.findUnique({
      where: { id: Number.parseInt(req.params.id) },
      select: { imageData: true, imageMimeType: true }
    });
    if (!mf || !mf.imageData) return res.status(404).end();
    
    const buffer = Buffer.from(mf.imageData, 'base64');
    res.setHeader('Content-Type', mf.imageMimeType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(buffer);
  } catch (err) {
    res.status(500).end();
  }
});

// Search menu items
app.get('/api/menu/search', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ 
        error: 'Database unavailable',
        message: 'Please try again later'
      });
    }
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const items = await prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            namePt: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            descriptionPt: {
              contains: q,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        category: true
      }
    });

    const searchResults = items.map(item => ({
      id: item.id.toString(),
      name: item.name,
      namePt: item.namePt,
      description: item.description,
      descriptionPt: item.descriptionPt,
      price: item.price,
      dietary: item.dietary ? item.dietary.split(',').filter(d => d.trim()) : [],
      hasSpiceCustomization: item.hasSpiceCustomization || false,
      category: item.category.name,
      imageUrl: item.imageUrl,
      brand: item.brand,
      volume: item.volume,
      concentration: item.concentration,
      gender: item.gender,
      fragranceFamily: item.fragranceFamily,
      topNotes: item.topNotes,
      middleNotes: item.middleNotes,
      baseNotes: item.baseNotes,
      stockQuantity: item.stockQuantity,
      inStock: item.inStock
    }));

    res.json(searchResults);
  } catch (error) {
    console.error('Error searching menu:', error);
    res.status(500).json({ error: 'Failed to search menu' });
  }
});

// ADMIN ENDPOINTS - Menu Management

// Get all categories (for admin dropdown)
app.get('/api/admin/categories', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const categories = await prisma.productCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories', details: error.message });
  }
});

// Create new category
app.post('/api/admin/categories', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await prisma.productCategory.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existingCategory) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const newCategory = await prisma.productCategory.create({
      data: {
        name: name.trim()
      }
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
app.put('/api/admin/categories/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if another category with this name exists
    const existingCategory = await prisma.productCategory.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        },
        NOT: {
          id: Number.parseInt(id)
        }
      }
    });

    if (existingCategory) {
      return res.status(409).json({ error: 'Category name already exists' });
    }

    const updatedCategory = await prisma.productCategory.update({
      where: { id: Number.parseInt(id) },
      data: { name: name.trim() }
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
app.delete('/api/admin/categories/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { id } = req.params;

    // Check if category has any menu items
    const category = await prisma.productCategory.findUnique({
      where: { id: Number.parseInt(id) }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const productCount = await prisma.product.count({
      where: { categoryId: Number.parseInt(id) }
    });

    if (productCount > 0) {
      return res.status(409).json({ 
        error: `Cannot delete category with ${productCount} menu item(s). Please move or delete the items first.` 
      });
    }

    await prisma.productCategory.delete({
      where: { id: Number.parseInt(id) }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Create new menu item
app.post('/api/admin/menu-items', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { 
      name, namePt, description, descriptionPt, price, 
      categoryId, imageUrl, brand, volume, concentration, 
      gender, fragranceFamily, topNotes, middleNotes, baseNotes,
      stockQuantity, inStock, imageData, imageMimeType, imageSize 
    } = req.body;
    
    const newItem = await prisma.product.create({
      data: {
        name,
        namePt: namePt || null,
        description,
        descriptionPt: descriptionPt || null,
        price: Number.parseFloat(price),
        brand: brand || null,
        volume: volume ? Number.parseFloat(volume) : null,
        concentration: concentration || null,
        gender: gender || null,
        fragranceFamily: fragranceFamily || null,
        topNotes: topNotes || null,
        middleNotes: middleNotes || null,
        baseNotes: baseNotes || null,
        stockQuantity: stockQuantity ? Number.parseInt(stockQuantity) : 0,
        inStock: inStock !== undefined ? inStock : true,
        categoryId: Number.parseInt(categoryId),
        imageUrl: imageUrl || null,
        imageData: imageData || null,
        imageMimeType: imageMimeType || null,
        imageSize: imageSize ? Number.parseInt(imageSize) : null
      },
      include: {
        category: true
      }
    });

    if (imageData) {
      const generatedUrl = `/api/images/product/${newItem.id}`;
      await prisma.product.update({
        where: { id: newItem.id },
        data: { imageUrl: generatedUrl }
      });
      newItem.imageUrl = generatedUrl;
    }

    res.json({
      id: newItem.id.toString(),
      name: newItem.name,
      namePt: newItem.namePt,
      description: newItem.description,
      descriptionPt: newItem.descriptionPt,
      price: newItem.price,
      brand: newItem.brand,
      volume: newItem.volume,
      concentration: newItem.concentration,
      gender: newItem.gender,
      fragranceFamily: newItem.fragranceFamily,
      topNotes: newItem.topNotes,
      middleNotes: newItem.middleNotes,
      baseNotes: newItem.baseNotes,
      stockQuantity: newItem.stockQuantity,
      inStock: newItem.inStock,
      categoryId: newItem.categoryId,
      category: newItem.category.name,
      imageUrl: newItem.imageUrl
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item
app.put('/api/admin/menu-items/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { id } = req.params;
    const { 
      name, namePt, description, descriptionPt, price, 
      categoryId, imageUrl, brand, volume, concentration, 
      gender, fragranceFamily, topNotes, middleNotes, baseNotes,
      stockQuantity, inStock, imageData, imageMimeType, imageSize 
    } = req.body;
    
    const updatedItem = await prisma.product.update({
      where: { id: Number.parseInt(id) },
      data: {
        name,
        namePt: namePt || null,
        description,
        descriptionPt: descriptionPt || null,
        price: Number.parseFloat(price),
        brand: brand || null,
        volume: volume ? Number.parseFloat(volume) : null,
        concentration: concentration || null,
        gender: gender || null,
        fragranceFamily: fragranceFamily || null,
        topNotes: topNotes || null,
        middleNotes: middleNotes || null,
        baseNotes: baseNotes || null,
        stockQuantity: stockQuantity ? Number.parseInt(stockQuantity) : 0,
        inStock: inStock !== undefined ? inStock : true,
        categoryId: Number.parseInt(categoryId),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(imageData !== undefined && { 
          imageData: imageData || null,
          imageMimeType: imageMimeType || null,
          imageSize: imageSize ? Number.parseInt(imageSize) : null,
          imageUrl: imageData ? `/api/images/product/${id}` : null
        })
      },
      include: {
        category: true
      }
    });

    res.json({
      id: updatedItem.id.toString(),
      name: updatedItem.name,
      namePt: updatedItem.namePt,
      description: updatedItem.description,
      descriptionPt: updatedItem.descriptionPt,
      price: updatedItem.price,
      brand: updatedItem.brand,
      volume: updatedItem.volume,
      concentration: updatedItem.concentration,
      gender: updatedItem.gender,
      fragranceFamily: updatedItem.fragranceFamily,
      topNotes: updatedItem.topNotes,
      middleNotes: updatedItem.middleNotes,
      baseNotes: updatedItem.baseNotes,
      stockQuantity: updatedItem.stockQuantity,
      inStock: updatedItem.inStock,
      categoryId: updatedItem.categoryId,
      category: updatedItem.category.name,
      imageUrl: updatedItem.imageUrl
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item
app.delete('/api/admin/menu-items/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { id } = req.params;
    
    // Get the item to check for legacy file-based image
    const item = await prisma.product.findUnique({
      where: { id: Number.parseInt(id) }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    // Delete the item (database-stored images are automatically removed)
    await prisma.product.delete({
      where: { id: Number.parseInt(id) }
    });
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Image upload endpoint - parses in memory and returns base64
app.post('/api/admin/upload-image', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    // Handle multer errors specifically
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'Image too large. Maximum file size is 5MB.' 
        });
      }
      if (err.message.includes('Only JPEG, PNG, WebP')) {
        return res.status(400).json({ 
          error: 'Invalid file type. Please use JPEG, PNG, or WebP format.' 
        });
      }
      return res.status(400).json({ 
        error: err.message || 'Invalid file upload.' 
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Return the base64 encoded data to the client
      const imageData = req.file.buffer.toString('base64');

      res.json({ 
        imageData,
        imageMimeType: req.file.mimetype,
        imageSize: req.file.size,
        message: 'Image processed successfully'
      });
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ error: 'Failed to process image' });
    }
  });
});

// ADMIN ENDPOINTS - Fragrance Repository Management

// Get all repository items (with pagination and search)
app.get('/api/admin/repository', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { page = 1, limit = 20, category, q } = req.query;
    const offset = (Number.parseInt(page) - 1) * Number.parseInt(limit);
    
    const where = {};
    if (category && category !== 'all') {
      where.category = { name: category };
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    const [items, totalCount] = await Promise.all([
      prisma.masterFragrance.findMany({
        where,
        include: { category: true },
        skip: offset,
        take: Number.parseInt(limit),
        orderBy: { name: 'asc' }
      }),
      prisma.masterFragrance.count({ where })
    ]);

    res.json({
      items: items.map(item => ({
        ...item,
        category: item.category.name,
        id: item.id.toString()
      })),
      totalPages: Math.ceil(totalCount / Number.parseInt(limit)),
      totalCount
    });
  } catch (error) {
    console.error('Error fetching repository:', error);
    res.status(500).json({ error: 'Failed to fetch repository' });
  }
});

// Create new repository item
app.post('/api/admin/repository', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const data = req.body;
    const newItem = await prisma.masterFragrance.create({
      data: {
        ...data,
        price: data.price ? Number.parseFloat(data.price) : null,
        volume: data.volume ? Number.parseFloat(data.volume) : null,
        categoryId: Number.parseInt(data.categoryId),
        imageSize: data.imageSize ? Number.parseInt(data.imageSize) : null
      },
      include: { category: true }
    });
    
    if (data.imageData) {
      const generatedUrl = `/api/images/master/${newItem.id}`;
      await prisma.masterFragrance.update({
        where: { id: newItem.id },
        data: { imageUrl: generatedUrl }
      });
      newItem.imageUrl = generatedUrl;
    }
    res.status(201).json({ ...newItem, category: newItem.category.name, id: newItem.id.toString() });
  } catch (error) {
    console.error('Error creating repository item:', error);
    res.status(500).json({ error: 'Failed to create repository item' });
  }
});

// Update repository item
app.put('/api/admin/repository/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { id } = req.params;
    const data = req.body;
    const updatedItem = await prisma.masterFragrance.update({
      where: { id: Number.parseInt(id) },
      data: {
        ...data,
        id: undefined, // Don't update ID
        price: data.price ? Number.parseFloat(data.price) : null,
        volume: data.volume ? Number.parseFloat(data.volume) : null,
        categoryId: Number.parseInt(data.categoryId),
        imageSize: data.imageSize ? Number.parseInt(data.imageSize) : undefined,
        category: undefined, // Don't update relation object directly
        imageUrl: data.imageData ? `/api/images/master/${id}` : (data.imageUrl === undefined ? undefined : data.imageUrl)
      },
      include: { category: true }
    });
    res.json({ ...updatedItem, category: updatedItem.category.name, id: updatedItem.id.toString() });
  } catch (error) {
    console.error('Error updating repository item:', error);
    res.status(500).json({ error: 'Failed to update repository item' });
  }
});

// Delete repository item
app.delete('/api/admin/repository/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { id } = req.params;
    await prisma.masterFragrance.delete({
      where: { id: Number.parseInt(id) }
    });
    res.json({ message: 'Repository item deleted' });
  } catch (error) {
    console.error('Error deleting repository item:', error);
    res.status(500).json({ error: 'Failed to delete repository item' });
  }
});

// Add from repository to inventory (Cloning)
app.post('/api/admin/inventory/add-from-repository/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { id } = req.params;
    const { stockQuantity = 0, price } = req.body;

    const master = await prisma.masterFragrance.findUnique({
      where: { id: Number.parseInt(id) }
    });

    if (!master) {
      return res.status(404).json({ error: 'Master fragrance not found' });
    }

    const newItem = await prisma.product.create({
      data: {
        name: master.name,
        brand: master.brand,
        description: master.description || '',
        price: price ? Number.parseFloat(price) : (master.price || 0),
        volume: master.volume,
        concentration: master.concentration,
        gender: master.gender,
        fragranceFamily: master.fragranceFamily,
        topNotes: master.topNotes,
        middleNotes: master.middleNotes,
        baseNotes: master.baseNotes,
        stockQuantity: Number.parseInt(stockQuantity),
        inStock: Number.parseInt(stockQuantity) > 0,
        categoryId: master.categoryId,
        imageUrl: master.imageUrl,
        imageData: master.imageData,
        imageMimeType: master.imageMimeType,
        imageSize: master.imageSize,
        masterFragranceId: master.id
      },
      include: { category: true }
    });

    res.status(201).json({ ...newItem, category: newItem.category.name, id: newItem.id.toString() });
  } catch (error) {
    console.error('Error adding to inventory:', error);
    res.status(500).json({ error: 'Failed to add fragrance to inventory' });
  }
});

// Get all menu items for admin (with pagination)
app.get('/api/admin/menu-items', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { page = 1, limit = 10, category } = req.query;
    const offset = (Number.parseInt(page) - 1) * Number.parseInt(limit);
    
    const where = category && category !== 'all' ? {
      category: {
        name: {
          equals: category,
          mode: 'insensitive'
        }
      }
    } : {};
    
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          name: 'asc'
        },
        skip: offset,
        take: Number.parseInt(limit)
      }),
      prisma.product.count({ where })
    ]);
    
    const menuItems = items.map(item => ({
      id: item.id.toString(),
      name: item.name,
      namePt: item.namePt,
      description: item.description,
      descriptionPt: item.descriptionPt,
      price: item.price,
      brand: item.brand,
      volume: item.volume,
      concentration: item.concentration,
      gender: item.gender,
      fragranceFamily: item.fragranceFamily,
      topNotes: item.topNotes,
      middleNotes: item.middleNotes,
      baseNotes: item.baseNotes,
      stockQuantity: item.stockQuantity,
      inStock: item.inStock,
      categoryId: item.categoryId,
      category: item.category.name,
      // Use imageUrl from database (static file path)
      imageUrl: item.imageUrl
    }));
    
    res.json({
      items: menuItems,
      total,
      page: Number.parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching admin menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// ============================================================================
// ORDER MANAGEMENT
// ============================================================================

// Helper: Generate unique order number
function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replaceAll('-', '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${dateStr}-${random}`;
}

// Helper: Calculate delivery fee
function calculateDeliveryFee(address) {
  // Simple flat rate for now - can be enhanced with distance calculation
  return 2.5; // €2.50 delivery fee
}

// Helper: Format order for WhatsApp message
function formatOrderForWhatsApp(order) {
  const items = order.orderItems.map(item => {
    const spiceText = item.spiceLevel === undefined ? '' : ` - ${item.spiceLevel}% spice`;
    return `• ${item.quantity}x ${item.name} (€${item.totalPrice.toFixed(2)})${spiceText}`;
  }).join('\n');
  
  const address = typeof order.deliveryAddress === 'string' 
    ? order.deliveryAddress 
    : `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.postalCode}`;
  
  return `🔔 *NEW ORDER - ${order.orderNumber}*

👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}
📧 *Email:* ${order.customerEmail}

📦 *Items:*
${items}

💰 *Subtotal:* €${order.subtotal.toFixed(2)}
🚚 *Delivery:* €${order.deliveryFee.toFixed(2)}
💳 *Total:* €${order.total.toFixed(2)}

📍 *Delivery Address:*
${address}

💳 *Payment:* ${order.paymentMethod}
📊 *Status:* ${order.status}`;
}

// Helper: Send WhatsApp notification (Twilio or manual link)
async function sendWhatsAppNotification(order) {
  const message = formatOrderForWhatsApp(order);
  
  if (twilioClient && TWILIO_ENABLED) {
    // Automatic sending via Twilio
    try {
      console.log('\n📲 ══════════════════════════════════════════');
      console.log('   SENDING WHATSAPP VIA TWILIO');
      console.log('   ══════════════════════════════════════════');
      
      const result = await twilioClient.messages.create({
        from: TWILIO_WHATSAPP_FROM,
        to: `whatsapp:${RESTAURANT_WHATSAPP}`,
        body: message
      });
      
      console.log(`✅ WhatsApp sent successfully!`);
      console.log(`   Message SID: ${result.sid}`);
      console.log(`   Status: ${result.status}`);
      console.log('   ══════════════════════════════════════════\n');
      
      return { success: true, method: 'twilio', sid: result.sid };
      
    } catch (error) {
      console.error('❌ Twilio WhatsApp failed:', error.message);
      console.log('   Falling back to manual method...\n');
      // Fall through to manual method
    }
  }
  
  // Manual method (existing behavior)
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/${RESTAURANT_WHATSAPP.replaceAll('+', '')}?text=${encodedMessage}`;
  
  console.log('\n📲 ══════════════════════════════════════════');
  console.log('   WHATSAPP NOTIFICATION (MANUAL)');
  console.log('   ══════════════════════════════════════════');
  console.log(message);
  console.log('   ══════════════════════════════════════════');
  console.log(`   🔗 Send manually: ${whatsappLink}`);
  console.log('   ══════════════════════════════════════════\n');
  
  return { success: true, method: 'manual', link: whatsappLink };
}

// Legacy function name for backward compatibility
function logWhatsAppNotification(order) {
  return sendWhatsAppNotification(order);
}

// Helper: Send email notification to customer
async function sendCustomerConfirmationEmail(order) {
  console.log(`📧 sendCustomerConfirmationEmail called for order ${order.orderNumber}`);
  
  if (!resend) {
    console.warn('⚠️  Resend not configured - skipping customer email');
    console.warn('   RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET');
    return null;
  }

  try {
    console.log(`   Preparing email for ${RESEND_TEST_MODE ? RESEND_TEST_EMAIL : order.customerEmail}...`);
    
    const orderItemsHtml = order.orderItems.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${item.name}
          ${item.spiceLevel ? `<br><small style="color: #6b7280;">Spice Level: ${item.spiceLevel}</small>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const deliveryAddress = order.deliveryAddress;
    const addressHtml = `
      ${deliveryAddress.street}${deliveryAddress.apartment ? `, ${deliveryAddress.apartment}` : ''}<br>
      ${deliveryAddress.city}, ${deliveryAddress.postalCode}<br>
      ${deliveryAddress.country}
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #000000; color: #D4AF37; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-family: 'Forum', serif;">Namaste Curry House</h1>
          <p style="margin: 10px 0 0; font-size: 16px;">Order Confirmation</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${RESEND_TEST_MODE ? `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 0 0 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">⚠️ TEST MODE</p>
            <p style="margin: 5px 0 0; color: #92400e; font-size: 13px;">This email was sent to ${RESEND_TEST_EMAIL} for testing. Original recipient: ${order.customerEmail}</p>
          </div>
          ` : ''}
          <p style="font-size: 18px; color: #059669; font-weight: bold; margin-top: 0;">✓ Order Confirmed!</p>
          
          <p>Dear ${order.customerName},</p>
          
          <p>Thank you for your order! We've received your payment and are preparing your delicious meal.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #374151;">Order Number:</p>
            <p style="margin: 5px 0 0; font-size: 20px; color: #D4AF37;">${order.orderNumber}</p>
          </div>

          <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Order Details</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #D4AF37;">Item</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #D4AF37;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #D4AF37;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #D4AF37;">Subtotal:</td>
                <td style="padding: 12px; text-align: right; border-top: 2px solid #D4AF37;">€${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Delivery Fee:</td>
                <td style="padding: 12px; text-align: right;">€${order.deliveryFee.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #D4AF37;">Total:</td>
                <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; color: #D4AF37;">€${order.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; margin-top: 30px;">Delivery Address</h2>
          <p style="margin: 15px 0; line-height: 1.8;">${addressHtml}</p>
          ${order.deliveryInstructions ? `
            <p style="margin: 15px 0;"><strong>Delivery Instructions:</strong><br>${order.deliveryInstructions}</p>
          ` : ''}

          <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; margin-top: 30px;">What Happens Next?</h2>
          <ol style="line-height: 2;">
            <li>Our kitchen is preparing your order</li>
            <li>We'll send it out for delivery soon</li>
            <li>Expected delivery: 30-45 minutes</li>
          </ol>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>Need to change something?</strong><br>
            Contact us immediately at <a href="tel:${RESTAURANT_WHATSAPP}" style="color: #D4AF37;">${RESTAURANT_WHATSAPP}</a></p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #6b7280; font-size: 14px;">
            <p><strong>Namaste Curry House</strong></p>
            <p>Authentic Indian Cuisine in Portugal</p>
            <p>Phone: ${RESTAURANT_WHATSAPP} | Email: ${RESTAURANT_EMAIL}</p>
            <p style="margin-top: 20px;">Thank you for choosing us! 🙏 </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: 'Namaste Curry House <onboarding@resend.dev>',
      to: RESEND_TEST_MODE ? RESEND_TEST_EMAIL : order.customerEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: htmlContent,
    });

    const emailTo = RESEND_TEST_MODE ? RESEND_TEST_EMAIL : order.customerEmail;
    console.log(`✅ Customer confirmation email sent successfully!`);
    console.log(`   To: ${emailTo}${RESEND_TEST_MODE ? ' (TEST MODE)' : ''}`);
    console.log(`   Message ID:`, result.data?.id || result.id);
    if (RESEND_TEST_MODE && order.customerEmail !== RESEND_TEST_EMAIL) {
      console.log(`   (Original recipient: ${order.customerEmail})`);
    }
    return result;
  } catch (error) {
    console.error('❌ Error sending customer email:');
    console.error('   Error message:', error.message);
    console.error('   Error details:', error);
    return null;
  }
}

// Helper: Send email notification to restaurant owner
async function sendOwnerNotificationEmail(order) {
  if (!resend) {
    console.warn('⚠️  Resend not configured - skipping owner email');
    return null;
  }

  try {
    const orderItemsText = order.orderItems.map(item => {
      const spiceText = item.spiceLevel ? ` (${item.spiceLevel})` : '';
      return `${item.quantity}x ${item.name}${spiceText} - €${(item.price * item.quantity).toFixed(2)}`;
    }).join('\n');

    const deliveryAddress = order.deliveryAddress;
    const apartmentText = deliveryAddress.apartment ? `, ${deliveryAddress.apartment}` : '';
    const addressText = `${deliveryAddress.street}${apartmentText}, ${deliveryAddress.city}, ${deliveryAddress.postalCode}, ${deliveryAddress.country}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🔔 NEW ORDER RECEIVED</h1>
          <p style="margin: 10px 0 0; font-size: 18px; font-weight: bold;">${order.orderNumber}</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${RESEND_TEST_MODE ? `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 0 0 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">⚠️ TEST MODE</p>
            <p style="margin: 5px 0 0; color: #92400e; font-size: 13px;">This email was sent to ${RESEND_TEST_EMAIL} for testing. Original recipient: ${RESTAURANT_EMAIL}</p>
          </div>
          ` : ''}
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #dc2626;">ACTION REQUIRED: Prepare Order</p>
            <p style="margin: 5px 0 0; color: #991b1b;">Order Time: ${new Date(order.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/Lisbon' })}</p>
          </div>

          <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Customer Information</h2>
          <table style="width: 100%; margin: 15px 0;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Name:</td>
              <td style="padding: 8px 0;">${order.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;"><a href="tel:${order.customerPhone}" style="color: #dc2626;">${order.customerPhone}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">${order.customerEmail}</td>
            </tr>
          </table>

          <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-top: 25px;">Order Items</h2>
          <pre style="background-color: #f9fafb; padding: 15px; border-radius: 6px; white-space: pre-wrap; font-size: 14px; line-height: 1.8;">${orderItemsText}</pre>
          
          <table style="width: 100%; margin: 15px 0; font-size: 16px;">
            <tr>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">Subtotal:</td>
              <td style="padding: 8px 0 8px 20px; text-align: right; width: 100px;">€${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">Delivery Fee:</td>
              <td style="padding: 8px 0 8px 20px; text-align: right;">€${order.deliveryFee.toFixed(2)}</td>
            </tr>
            <tr style="border-top: 2px solid #dc2626;">
              <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: #dc2626;">TOTAL:</td>
              <td style="padding: 12px 0 12px 20px; text-align: right; font-size: 18px; font-weight: bold; color: #dc2626;">€${order.total.toFixed(2)}</td>
            </tr>
          </table>

          <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-top: 25px;">Delivery Address</h2>
          <p style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 15px 0; line-height: 1.8; font-size: 15px;">${addressText}</p>
          
          ${order.deliveryInstructions ? `
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #92400e;">Delivery Instructions:</p>
              <p style="margin: 5px 0 0; color: #92400e;">${order.deliveryInstructions}</p>
            </div>
          ` : ''}

          <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #166534;">Payment Status:</p>
            <p style="margin: 5px 0 0; color: #166534; font-size: 18px; font-weight: bold;">✓ PAID (${order.paymentMethod})</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center;">
            <a href="https://www.namastecurry.house/admin#orders" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px;">View in Admin Dashboard</a>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: 'Namaste Orders <onboarding@resend.dev>',
      to: RESEND_TEST_MODE ? RESEND_TEST_EMAIL : RESTAURANT_EMAIL,
      subject: `🔔 NEW ORDER: ${order.orderNumber} - €${order.total.toFixed(2)}`,
      html: htmlContent,
    });

    const emailTo = RESEND_TEST_MODE ? RESEND_TEST_EMAIL : RESTAURANT_EMAIL;
    console.log(`✅ Owner notification email sent to ${emailTo}${RESEND_TEST_MODE ? ' (TEST MODE)' : ''}`);
    if (RESEND_TEST_MODE && RESTAURANT_EMAIL !== RESEND_TEST_EMAIL) {
      console.log(`   (Original recipient: ${RESTAURANT_EMAIL})`);
    }
    return result;
  } catch (error) {
    console.error('❌ Error sending owner email:', error);
    return null;
  }
}


// GET /api/orders - Get all orders (for admin)
app.get('/api/orders', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Last 100 orders
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const orderId = Number.parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET /api/orders/number/:orderNumber - Get order by order number
app.get('/api/orders/number/:orderNumber', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET /api/orders/:id/whatsapp-link - Generate WhatsApp notification link for an order
app.get('/api/orders/:id/whatsapp-link', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const orderId = Number.parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const message = formatOrderForWhatsApp(order);
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${RESTAURANT_WHATSAPP.replaceAll('+', '')}?text=${encodedMessage}`;
    
    res.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      whatsappLink,
      message,
      restaurantWhatsApp: RESTAURANT_WHATSAPP
    });
  } catch (error) {
    console.error('Error generating WhatsApp link:', error);
    res.status(500).json({ error: 'Failed to generate WhatsApp link' });
  }
});

// POST /api/orders/:id/send-emails - Manually trigger email notifications for an order (testing/retry)
app.post('/api/orders/:id/send-emails', express.json(), async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const orderId = Number.parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log(`📧 Manual email trigger for order ${order.orderNumber}...`);
    
    const results = {
      orderNumber: order.orderNumber,
      customerEmail: null,
      ownerEmail: null,
      resendConfigured: Boolean(resend),
      testMode: RESEND_TEST_MODE,
    };

    // Send customer confirmation email
    console.log('📧 Sending customer confirmation email...');
    const customerResult = await sendCustomerConfirmationEmail(order);
    results.customerEmail = {
      sent: Boolean(customerResult),
      result: customerResult,
    };

    // Send owner notification email
    console.log('📧 Sending owner notification email...');
    const ownerResult = await sendOwnerNotificationEmail(order);
    results.ownerEmail = {
      sent: Boolean(ownerResult),
      result: ownerResult,
    };

    res.json(results);
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ error: 'Failed to send emails', details: error.message });
  }
});

// POST /api/orders/whatsapp - Create order via WhatsApp
app.post('/api/orders/whatsapp', express.json(), async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const { orderItems, customerInfo, deliveryAddress } = req.body;
    
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryFee = calculateDeliveryFee(deliveryAddress);
    const total = subtotal + deliveryFee;
    const orderNumber = generateOrderNumber();
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email || '',
        customerPhone: customerInfo.phone,
        deliveryAddress: deliveryAddress,
        orderItems: orderItems,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'WHATSAPP',
      },
    });
    
    console.log(`📲 WhatsApp order created: ${order.orderNumber}`);
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error creating WhatsApp order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ============================================================================
// STORE STATUS ENDPOINTS
// ============================================================================

// Helper function to get or create store status
async function getStoreStatus() {
  let status = await prisma.storeStatus.findUnique({
    where: { id: 1 }
  });
  
  // Create default status if it doesn't exist
  if (!status) {
    status = await prisma.storeStatus.create({
      data: {
        id: 1,
        isOpen: true,
        closedMessage: null,
        reopenTime: null
      }
    });
  }
  
  return status;
}

// GET /api/store-status - Public endpoint to check if store is open
app.get('/api/store-status', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const status = await getStoreStatus();
    res.json(status);
  } catch (error) {
    console.error('Error fetching store status:', error);
    res.status(500).json({ error: 'Failed to fetch store status' });
  }
});

// POST /api/admin/store-status - Admin endpoint to update store status
app.post('/api/admin/store-status', express.json(), async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const { isOpen, closedMessage, reopenTime, updatedBy } = req.body;

    // Validation
    if (typeof isOpen !== 'boolean') {
      return res.status(400).json({ error: 'isOpen must be a boolean' });
    }

    // Ensure store status record exists
    await getStoreStatus();

    // Update store status
    const status = await prisma.storeStatus.update({
      where: { id: 1 },
      data: {
        isOpen,
        closedMessage: closedMessage || null,
        reopenTime: reopenTime ? new Date(reopenTime) : null,
        updatedBy: updatedBy || 'admin'
      }
    });

    console.log(`🚪 Store status updated: ${isOpen ? 'OPEN' : 'CLOSED'} by ${updatedBy || 'admin'}`);
    
    res.json(status);
  } catch (error) {
    console.error('Error updating store status:', error);
    res.status(500).json({ error: 'Failed to update store status' });
  }
});

// Test endpoint for debugging
app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint hit!');
  res.json({ ok: true, message: 'Server is working!' });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

// Export for Vercel serverless
export default app;

// Start server only when not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  async function startServer() {
    try {
      await ensureDbConnection(true);
    } catch (error) {
      console.error('Database connection warning:', error.message);
    }
    
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Database status: ${dbConnected ? 'connected' : 'disconnected'}`);
    });
    
    // Keep reference to server to prevent process from exiting
    return server;
  }

  try {
    await startServer();
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
