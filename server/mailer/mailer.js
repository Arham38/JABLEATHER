const {
  orderReceivedTemplate,
  paymentConfirmedTemplate,
  orderShippedTemplate,
} = require('./templates');

/**
 * Development Console Email Transport
 * Safely prints outgoing transactional emails without transmitting over SMTP.
 */
class ConsoleTransport {
  async send({ to, subject, html }) {
    console.log('\n================== [OUTGOING EMAIL (DEV SIMULATION)] ==================');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Sent At: ${new Date().toISOString()}`);
    console.log('Preview:');
    // Extract readable text from first few lines of html
    const preview = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);
    console.log(`"${preview}..."`);
    console.log('========================================================================\n');
    return { messageId: `dev_${Date.now()}`, success: true };
  }
}

/**
 * Production Email Service (TODO)
 *
 * When taking live, replace ConsoleTransport with your production provider:
 *
 * Option A (Resend):
 *   const { Resend } = require('resend');
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   await resend.emails.send({ from: 'orders@jableather.com', to, subject, html });
 *
 * Option B (Nodemailer / SMTP):
 *   const nodemailer = require('nodemailer');
 *   const transporter = nodemailer.createTransport({ ... });
 *   await transporter.sendMail({ from: '"JAB LEATHER" <orders@jableather.com>', to, subject, html });
 */
const currentTransport = new ConsoleTransport();

async function sendMail({ to, subject, html }) {
  if (!to) {
    console.warn('[Mailer] Skipping email dispatch: recipient address is empty');
    return { success: false, reason: 'no_recipient' };
  }
  return await currentTransport.send({ to, subject, html });
}

async function sendOrderReceived(order) {
  const email = order.customer?.email;
  const html = orderReceivedTemplate(order);
  return sendMail({
    to: email,
    subject: `Order Confirmation #${order.order_number} – JAB LEATHER`,
    html,
  });
}

async function sendPaymentConfirmed(order, payment) {
  const email = order.customer?.email;
  const html = paymentConfirmedTemplate(order, payment);
  return sendMail({
    to: email,
    subject: `Payment Confirmed #${order.order_number} – JAB LEATHER`,
    html,
  });
}

async function sendOrderShipped(order, trackingInfo) {
  const email = order.customer?.email;
  const html = orderShippedTemplate(order, trackingInfo);
  return sendMail({
    to: email,
    subject: `Your JAB LEATHER Order #${order.order_number} Has Been Shipped`,
    html,
  });
}

module.exports = {
  sendMail,
  sendOrderReceived,
  sendPaymentConfirmed,
  sendOrderShipped,
};
