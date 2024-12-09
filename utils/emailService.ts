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
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;">
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ${item.name}
            <br>
            <small>Size: ${item.size}</small>
            <br>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/review/${order.id}/${item.id}/${item.variant_id}" style="color: #4F46E5; text-decoration: none;">
              Write a Review
            </a>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ${item.quantity}x
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            €${item.price.toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  const template = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-details { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 10px; background: #f8f8f8; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
          .review-cta { 
            background: #4F46E5;
            color: white;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order!</p>
          </div>
          
          <div class="order-details">
            <h2>Order #${id}</h2>
            <p>Order Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right; padding: 10px;"><strong>Subtotal:</strong></td>
                  <td style="padding: 10px;">€${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align: right; padding: 10px;"><strong>Shipping${shippingName ? ` (${shippingName})` : ''}:</strong></td>
                  <td style="padding: 10px;">€${shippingCost.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align: right; padding: 10px;"><strong>VAT (23%):</strong></td>
                  <td style="padding: 10px;">€${vatAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align: right; padding: 10px;"><strong>Total:</strong></td>
                  <td style="padding: 10px;"><strong>€${total.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p>Once you receive your items, we'd love to hear your thoughts!</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders/${id}" class="review-cta">
              View Order & Write Reviews
            </a>
          </div>

          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <small>If you have any questions, please contact our support team.</small>
          </div>
        </div>
      </body>
    </html>
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