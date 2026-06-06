const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: `First Edition <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

const sendOrderConfirmation = async (order, user) => {
  const itemsList = order.items.map(item => 
    `<li>${item.name} - Size: ${item.size}, Color: ${item.color}, Qty: ${item.quantity} - $${item.price}</li>`
  ).join('');

  const html = `
    <h2>Order Confirmation</h2>
    <p>Hi ${user.name},</p>
    <p>Thank you for your order!</p>
    <h3>Order #${order.orderNumber}</h3>
    <ul>${itemsList}</ul>
    <p><strong>Total: $${order.pricing.total}</strong></p>
    <p>We'll notify you when your order ships.</p>
  `;

  await sendEmail({
    email: user.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html
  });
};

const sendDropNotification = async (email, drop) => {
  const html = `
    <h2>${drop.title} is Now Live!</h2>
    <p>The limited edition drop you requested notification for is now available.</p>
    <p>Shop now before it's sold out!</p>
    <a href="${process.env.FRONTEND_URL}/drops/${drop.slug}">View Drop</a>
  `;

  await sendEmail({
    email,
    subject: `${drop.title} - Now Available`,
    html
  });
};

module.exports = { sendEmail, sendOrderConfirmation, sendDropNotification };
