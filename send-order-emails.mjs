// Send emails for an existing order
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const orderNumber = process.argv[2];

if (!orderNumber) {
  console.error('❌ Please provide order number');
  console.error('Usage: node send-order-emails.mjs ORD-20251119-XXX');
  process.exit(1);
}

async function sendEmails() {
  try {
    console.log(`📧 Sending emails for ${orderNumber}...\n`);
    
    const order = await prisma.order.findUnique({
      where: { orderNumber }
    });
    
    if (!order) {
      console.error(`❌ Order ${orderNumber} not found`);
      return;
    }
    
    console.log('✅ Order found');
    console.log('   Customer:', order.customerEmail);
    console.log('   Status:', order.status);
    console.log('   Total: €' + order.total);
    
    // Parse JSON fields
    const orderWithItems = {
      ...order,
      items: typeof order.orderItems === 'string' ? JSON.parse(order.orderItems) : order.orderItems,
      deliveryAddress: typeof order.deliveryAddress === 'string' ? JSON.parse(order.deliveryAddress) : order.deliveryAddress
    };
    
    console.log('\n1️⃣ Sending customer confirmation email...');
    const customerResult = await resend.emails.send({
      from: 'Namaste Curry <orders@namastecurry.house>',
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: generateCustomerEmail(orderWithItems)
    });
    
    if (customerResult.error) {
      console.error('❌ Customer email error:', customerResult.error);
    } else {
      console.log('✅ Customer email sent! ID:', customerResult.data.id);
    }
    
    console.log('\n2️⃣ Sending owner notification email...');
    const ownerResult = await resend.emails.send({
      from: 'Namaste Curry <orders@namastecurry.house>',
      to: process.env.RESTAURANT_EMAIL || 'support@shopsphere.app',
      subject: `New Order - ${order.orderNumber}`,
      html: generateOwnerEmail(orderWithItems)
    });
    
    if (ownerResult.error) {
      console.error('❌ Owner email error:', ownerResult.error);
    } else {
      console.log('✅ Owner email sent! ID:', ownerResult.data.id);
    }
    
    console.log('\n✅ Done! Check your email inbox (and spam folder)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateCustomerEmail(order) {
  const orderItemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        ${item.name}
        ${item.customization?.spiceLevel ? `<br><small style="color: #6b7280;">Spice Level: ${item.customization.spiceLevel}</small>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const address = order.deliveryAddress;
  const addressHtml = `
    ${address.street}${address.apartment ? `, ${address.apartment}` : ''}<br>
    ${address.city}, ${address.postalCode}<br>
    ${address.country}
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #000; color: #D4AF37; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">Namaste Curry House</h1>
        <p>Order Confirmation</p>
      </div>
      
      <div style="background: white; padding: 30px;">
        <p style="font-size: 18px; color: #059669; font-weight: bold;">✓ Order Confirmed!</p>
        <p>Dear ${order.customerName},</p>
        <p>Thank you for your order!</p>
        
        <div style="background: #f3f4f6; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">Order Number:</p>
          <p style="margin: 5px 0 0; font-size: 20px; color: #D4AF37;">${order.orderNumber}</p>
        </div>

        <h2>Order Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>${orderItemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #D4AF37;">Total:</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #D4AF37; color: #D4AF37;">€${order.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <h2>Delivery Address</h2>
        <p>${addressHtml}</p>
      </div>
    </body>
    </html>
  `;
}

function generateOwnerEmail(order) {
  const orderItemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        ${item.name}
        ${item.customization?.spiceLevel ? `<br><small>Spice: ${item.customization.spiceLevel}</small>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const address = order.deliveryAddress;
  const addressHtml = `
    ${address.street}${address.apartment ? `, ${address.apartment}` : ''}<br>
    ${address.city}, ${address.postalCode}<br>
    ${address.country}
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #ef4444; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">🔔 NEW ORDER</h1>
        <p>${order.orderNumber}</p>
      </div>
      
      <div style="background: white; padding: 30px;">
        <h2>Customer Details</h2>
        <p><strong>Name:</strong> ${order.customerName}<br>
        <strong>Email:</strong> ${order.customerEmail}<br>
        <strong>Phone:</strong> ${order.customerPhone}</p>

        <h2>Order Items</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>${orderItemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #000;">Total:</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #000;">€${order.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <h2>Delivery Address</h2>
        <p>${addressHtml}</p>
        ${order.deliveryInstructions ? `<p><strong>Instructions:</strong> ${order.deliveryInstructions}</p>` : ''}
        
        <div style="background: #dcfce7; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>✓ Payment Confirmed</strong><br>Paid via Stripe</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

sendEmails();

