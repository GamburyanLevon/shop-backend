const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL } = process.env;

let transporter = null;
if (SMTP_HOST && SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

async function sendOrderEmail(order, items) {
  if (!transporter) {
    console.log('SMTP not configured — skipping email send.');
    return;
  }
  const to = process.env.ADMIN_EMAIL || SMTP_USER;
  const subject = `New Order #${order.id} - $${order.total.toFixed(2)}`;
  const html = `
    <h2>New Order #${order.id}</h2>
    <p>Total: $${order.total.toFixed(2)}</p>
    <ul>
      ${items.map(i => `<li>${i.quantity}x ${i.product.title} - $${i.price.toFixed(2)}</li>`).join('')}
    </ul>
    <p>Placed at: ${order.createdAt}</p>
  `;
  await transporter.sendMail({ from: SMTP_USER, to, subject, html });
}

module.exports = { sendOrderEmail };