import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createTestOrder() {
  console.log('🧪 Creating Test Order...\n');
  
  try {
    // Step 1: Create a test order in database
    console.log('1️⃣ Creating order in database...');
    
    const orderNumber = `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;
    
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: orderNumber,
        customerName: 'Jun Cando',
        customerEmail: 'juncando@gmail.com',
        customerPhone: '+351920617185',
        deliveryAddress: {
          street: 'Test Street 123',
          apartment: 'Apt 4B',
          city: 'Lisbon',
          postalCode: '1000-001',
          country: 'Portugal'
        },
        deliveryInstructions: 'Ring the bell twice',
        orderItems: [
          {
            id: 'test-item-1',
            name: 'Chicken Tikka Masala',
            price: 12.50,
            quantity: 2,
            customization: {
              spiceLevel: 3
            }
          },
          {
            id: 'test-item-2',
            name: 'Garlic Naan',
            price: 2.50,
            quantity: 2
          }
        ],
        subtotal: 30.00,
        deliveryFee: 2.50,
        total: 32.50,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'STRIPE_CARD'
      }
    });
    
    console.log('   ✅ Order created:', orderNumber);
    console.log('   Order ID:', testOrder.id);
    
    // Step 2: Create Stripe checkout session
    console.log('\n2️⃣ Creating Stripe checkout session...');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Test Order - ' + orderNumber,
              description: 'Chicken Tikka Masala (x2), Garlic Naan (x2)'
            },
            unit_amount: 3250 // €32.50 in cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: 'https://www.namastecurry.house/order-confirmation?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.namastecurry.house/checkout',
      customer_email: 'juncando@gmail.com',
      metadata: {
        orderNumber: orderNumber,
        orderId: testOrder.id.toString()
      }
    });
    
    console.log('   ✅ Stripe session created:', session.id);
    
    // Step 3: Update order with session ID
    console.log('\n3️⃣ Linking order to Stripe session...');
    
    await prisma.order.update({
      where: { id: testOrder.id },
      data: {
        stripeSessionId: session.id
      }
    });
    
    console.log('   ✅ Order linked to session');
    
    // Step 4: Display test payment URL
    console.log('\n' + '═'.repeat(70));
    console.log('🎉 Test Order Created Successfully!');
    console.log('═'.repeat(70));
    console.log('\n📋 Order Details:');
    console.log('   Order Number:', orderNumber);
    console.log('   Customer:', 'juncando@gmail.com');
    console.log('   Restaurant:', 'support@fumeslane.app');
    console.log('   Total:', '€32.50');
    console.log('   Status:', 'PENDING (waiting for payment)');
    
    console.log('\n💳 Test Payment:');
    console.log('   Session URL:', session.url);
    
    console.log('\n🧪 To complete the test:');
    console.log('   1. Open the URL above in your browser');
    console.log('   2. Use Stripe test card: 4242 4242 4242 4242');
    console.log('   3. Any future expiry date (e.g., 12/34)');
    console.log('   4. Any 3-digit CVC (e.g., 123)');
    console.log('   5. Any ZIP code (e.g., 12345)');
    
    console.log('\n📧 Expected Result:');
    console.log('   - Webhook will update order to CONFIRMED');
    console.log('   - Customer email sent to: juncando@gmail.com');
    console.log('   - Owner notification sent to: support@fumeslane.app');
    
    console.log('\n⏱️  Check results in 1-2 minutes:');
    console.log('   - Run: node scripts/check-latest-order.mjs');
    console.log('   - Check your email inbox (both accounts)');
    
    console.log('\n' + '═'.repeat(70) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder();

