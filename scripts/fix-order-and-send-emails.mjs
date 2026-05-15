import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const RESEND_TEST_MODE = process.env.RESEND_TEST_MODE === 'true';
const RESEND_TEST_EMAIL = process.env.RESEND_TEST_EMAIL || 'juncando@gmail.com';
const RESTAURANT_EMAIL = process.env.RESTAURANT_EMAIL || 'support@shopsphere.app';

async function fixOrderAndSendEmails(orderNumber) {
  console.log(`🔧 Fixing order ${orderNumber} and sending emails...\n`);
  
  try {
    // Step 1: Update order status
    console.log('1️⃣ Updating order status...');
    
    const order = await prisma.order.update({
      where: { orderNumber: orderNumber },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'SUCCEEDED',
        confirmedAt: new Date(),
        stripePaymentIntentId: 'pi_3STkPE4AYllAtAxr2hPRK4Xf' // From the check
      }
    });
    
    console.log('   ✅ Order updated to CONFIRMED');
    
    // Step 2: Send customer confirmation email
    console.log('\n2️⃣ Sending customer confirmation email...');
    
    const customerEmail = RESEND_TEST_MODE ? RESEND_TEST_EMAIL : order.customerEmail;
    
    const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];
    const itemsList = orderItems.map(item => 
      `<li>${item.name} x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}</li>`
    ).join('');
    
    const customerEmailResult = await resend.emails.send({
      from: 'Namaste Curry House <orders@namastecurry.house>',
      to: customerEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D97706;">Order Confirmed!</h2>
          <p>Dear ${order.customerName},</p>
          <p>Thank you for your order! We've received your payment and are preparing your delicious Indian meal.</p>
          
          <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Total:</strong> €${order.total.toFixed(2)}</p>
            <p><strong>Delivery Fee:</strong> €${order.deliveryFee.toFixed(2)}</p>
          </div>
          
          <h3>Your Items:</h3>
          <ul>${itemsList}</ul>
          
          <h3>Delivery Address:</h3>
          <p>
            ${order.deliveryAddress.street}<br>
            ${order.deliveryAddress.apartment ? order.deliveryAddress.apartment + '<br>' : ''}
            ${order.deliveryAddress.city}, ${order.deliveryAddress.postalCode}<br>
            ${order.deliveryAddress.country}
          </p>
          
          ${order.deliveryInstructions ? `<p><strong>Delivery Instructions:</strong> ${order.deliveryInstructions}</p>` : ''}
          
          <p style="margin-top: 30px;">We'll notify you when your order is on its way!</p>
          <p>Thank you for choosing Namaste Curry House!</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 14px;">
            <p>Namaste Curry House | ${RESTAURANT_EMAIL}</p>
          </div>
        </div>
      `
    });
    
    console.log('   ✅ Customer email sent:', customerEmail);
    console.log('   Email ID:', customerEmailResult.data?.id);
    
    // Step 3: Send restaurant notification
    console.log('\n3️⃣ Sending restaurant notification...');
    
    const ownerEmailResult = await resend.emails.send({
      from: 'Namaste Curry House <orders@namastecurry.house>',
      to: RESTAURANT_EMAIL,
      subject: `New Order - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D97706;">New Order Received!</h2>
          
          <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order ${order.orderNumber}</h3>
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Phone:</strong> ${order.customerPhone}</p>
            <p><strong>Email:</strong> ${order.customerEmail}</p>
            <p><strong>Total:</strong> €${order.total.toFixed(2)}</p>
            <p><strong>Payment:</strong> PAID (Stripe)</p>
          </div>
          
          <h3>Items:</h3>
          <ul>${itemsList}</ul>
          
          <h3>Delivery Address:</h3>
          <p>
            ${order.deliveryAddress.street}<br>
            ${order.deliveryAddress.apartment ? order.deliveryAddress.apartment + '<br>' : ''}
            ${order.deliveryAddress.city}, ${order.deliveryAddress.postalCode}<br>
            ${order.deliveryAddress.country}
          </p>
          
          ${order.deliveryInstructions ? `<p><strong>Special Instructions:</strong> ${order.deliveryInstructions}</p>` : ''}
          
          <p style="margin-top: 30px;"><strong>Action Required:</strong> Please prepare this order for delivery.</p>
        </div>
      `
    });
    
    console.log('   ✅ Restaurant email sent:', RESTAURANT_EMAIL);
    console.log('   Email ID:', ownerEmailResult.data?.id);
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ Order fixed and emails sent successfully!');
    console.log('═'.repeat(60));
    console.log('\n📧 Check your inboxes:');
    console.log(`   Customer: ${customerEmail}`);
    console.log(`   Restaurant: ${RESTAURANT_EMAIL}`);
    console.log('\n💡 Note: The webhook issue still needs to be fixed for future orders.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  } finally {
    await prisma.$disconnect();
  }
}

const orderNumber = process.argv[2] || 'ORD-20251115-277';
fixOrderAndSendEmails(orderNumber);

