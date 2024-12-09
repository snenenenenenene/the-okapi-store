/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer'

interface OrderItem {
  product: {
    name: string
    image: string
  }
  quantity: number
  price: number
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export const sendOrderConfirmationEmail = async (order: any) => {
  const { 
    id, 
    orderItems, 
    subtotal, 
    shippingCost, 
    vatAmount, 
    total,
    shippingName 
  } = order;

  const itemsHtml = orderItems
    .map(
      (item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.size || ''}</td>
          <td style="padding: 10px; border-bottom: 1px; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");

  const template = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Thank you for your order!</h1>
      <p>Your order #${id} has been received and is being processed.</p>
      
      <div style="margin: 20px 0;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders/${id}" 
           style="background-color: #8D6E63; 
                  color: white; 
                  padding: 12px 25px; 
                  text-decoration: none; 
                  border-radius: 5px;
                  font-weight: bold;
                  display: inline-block;
                  margin-right: 10px;">
          View Order
        </a>
        <a href="mailto:?subject=Check%20out%20my%20Okapi%20Store%20order!&body=You%20can%20view%20my%20order%20here%3A%20${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${id}`)}" 
           style="background-color: #A5D6A7; 
                  color: white; 
                  padding: 12px 25px; 
                  text-decoration: none; 
                  border-radius: 5px;
                  font-weight: bold;
                  display: inline-block;">
          Share Order
        </a>
      </div>

      <h2 style="color: #333;">Order Summary:</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f8f8f8;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: left;">Size</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
            <td style="padding: 10px;">€${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right;"><strong>Shipping${shippingName ? ` (${shippingName})` : ''}:</strong></td>
            <td style="padding: 10px;">€${shippingCost.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right;"><strong>VAT (23%):</strong></td>
            <td style="padding: 10px;">€${vatAmount.toFixed(2)}</td>
          </tr>
          <tr style="background-color: #f8f8f8;">
            <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 10px;"><strong>€${total.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>

      <div style="margin: 20px 0; padding: 20px; background-color: #f8f8f8; border-radius: 5px;">
        <h3 style="color: #333; margin-top: 0;">Shipping Information</h3>
        <p>Your order will be carefully packaged and shipped within 2-3 business days.</p>
      </div>

      <div style="margin-top: 20px; color: #666;">
        <p>Questions about your order? Contact us at:</p>
        <p><a href="mailto:theokapistore@gmail.com" style="color: #8D6E63;">theokapistore@gmail.com</a></p>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #EEE; text-align: center;">
        <p style="color: #8D6E63; font-size: 12px;">
          The Okapi Store<br>
          Your favorite Okapi-themed shop<br><br>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color: #8D6E63; text-decoration: none;">Visit our store</a>
        </p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'theokapistore@gmail.com',
      to: order.user.email,
      subject: `Order Confirmation - The Okapi Store #${id}`,
      html: template,
    })
    console.log('Order confirmation email sent successfully')
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    throw error
  }
}