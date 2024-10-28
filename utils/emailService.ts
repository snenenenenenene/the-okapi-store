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

export const sendOrderConfirmationEmail = async (
  email: string,
  orderId: string,
  items: OrderItem[],
  total: number,
  printfulOrder: any
) => {
  const orderUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}`

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 20px;">
        <img src="${process.env.NEXT_PUBLIC_BASE_URL}/images/okapi-logo.png" alt="Okapi Store Logo" style="width: 100px; height: auto;">
      </div>
      
      <h1 style="color: #8D6E63; text-align: center;">Thank you for your order!</h1>
      
      <p style="color: #5D4037;">Your order #${orderId} has been received and is being processed.</p>

      <div style="text-align: center; margin: 20px 0;">
        <table style="margin: 0 auto;">
          <tr>
            <td>
              <a href="${orderUrl}" 
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
            </td>
            <td>
              <a href="mailto:?subject=Check%20out%20my%20Okapi%20Store%20order!&body=You%20can%20view%20my%20order%20here%3A%20${encodeURIComponent(orderUrl)}" 
                 style="background-color: #A5D6A7; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px;
                        font-weight: bold;
                        display: inline-block;">
                Share Order
              </a>
            </td>
          </tr>
        </table>
      </div>
      
      <h2 style="color: #5D4037; margin-top: 30px;">Order Summary:</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background-color: #F5F5F5;">
            <th style="width: 60px; padding: 10px; text-align: left; color: #5D4037;">Item</th>
            <th style="padding: 10px; text-align: left; color: #5D4037;">Details</th>
            <th style="padding: 10px; text-align: center; color: #5D4037;">Qty</th>
            <th style="padding: 10px; text-align: right; color: #5D4037;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #EEE;">
                <img src="${item.product.image}" alt="${item.product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #EEE; color: #5D4037;">
                ${item.product.name}
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #EEE; color: #5D4037; text-align: center;">
                ${item.quantity}
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #EEE; color: #5D4037; text-align: right;">
                €${item.price.toFixed(2)}
              </td>
            </tr>
          `).join('')}
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; color: #5D4037;">Total:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: #8D6E63;">€${total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 30px; padding: 20px; background-color: #F5F5F5; border-radius: 5px;">
        <h3 style="color: #5D4037; margin-top: 0;">Shipping Information</h3>
        <p style="color: #5D4037; margin: 5px 0;">
          Your order will be carefully packaged and shipped within 2-3 business days.
          ${printfulOrder.tracking_number ? `<br>Tracking Number: ${printfulOrder.tracking_number}` : ''}
        </p>
      </div>
      
      <div style="margin-top: 30px; text-align: center;">
        <p style="color: #5D4037; font-size: 14px;">
          Questions about your order? Contact us at:<br>
          <a href="mailto:theokapistore@gmail.com" style="color: #8D6E63;">theokapistore@gmail.com</a>
        </p>
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
      to: email,
      subject: `Order Confirmation - The Okapi Store #${orderId}`,
      html: emailHtml,
    })
    console.log('Order confirmation email sent successfully')
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    throw error
  }
}