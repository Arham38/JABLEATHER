/**
 * Plain HTML Email Templates for JAB LEATHER
 * Responsive, clean luxury aesthetic matching atelier branding.
 */

const baseEmailLayout = ({ title, preheader, content }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #171717; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #ddd8d0; }
    .header { background-color: #171717; padding: 32px 24px; text-align: center; }
    .brand-title { color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
    .brand-subtitle { color: #a66a3f; font-size: 10px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; margin-top: 6px; }
    .body-content { padding: 36px 32px; }
    .h1 { font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; color: #171717; }
    .p { font-size: 14px; line-height: 1.6; color: #4b4742; margin-bottom: 20px; }
    .order-box { background-color: #faf8f5; border: 1px solid #eeebe4; border-radius: 4px; padding: 20px; margin: 24px 0; }
    .table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .table th { text-align: left; padding: 8px 0; border-bottom: 1px solid #ddd8d0; color: #6b665f; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    .table td { padding: 12px 0; border-bottom: 1px solid #eeebe4; color: #171717; }
    .total-row td { font-weight: bold; border-top: 2px solid #171717; border-bottom: none; font-size: 15px; padding-top: 14px; }
    .footer { background-color: #f7f5f0; padding: 24px; text-align: center; font-size: 11px; color: #8c827a; border-top: 1px solid #ddd8d0; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#f7f5f0;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">JAB LEATHER</h1>
      <div class="brand-subtitle">Sialkot • Pakistan</div>
    </div>
    <div class="body-content">
      ${content}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px;">JAB LEATHER Handcrafted Goods • Export Processing Zone, Sialkot, Pakistan</p>
      <p style="margin: 0;">Worldwide Express Shipping • Guaranteed Full-Grain Leather</p>
    </div>
  </div>
</body>
</html>
`;

function orderReceivedTemplate(order) {
  const customerName = order.customer?.name || order.customer?.firstName || 'Valued Customer';
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsHtml = items.map(item => `
    <tr>
      <td>
        <strong>${item.name || 'Leather Item'}</strong><br>
        <span style="color:#8c827a;font-size:11px;">Size: ${item.size || 'Standard'} • Color: ${item.color || 'Classic'} • Qty: ${item.quantity || 1}</span>
      </td>
      <td style="text-align:right;">${order.currency} ${(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
    </tr>
  `).join('');

  const content = `
    <h2 class="h1">Order Received – #${order.order_number}</h2>
    <p class="p">Dear ${customerName},</p>
    <p class="p">Thank you for your order with JAB LEATHER. Our artisans in Sialkot have received your commission and are preparing your leathercraft.</p>
    
    <div class="order-box">
      <table class="table">
        <thead>
          <tr>
            <th>Item & Specifications</th>
            <th style="text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td style="color:#6b665f;">Shipping (${order.shipping_address?.country || 'International'})</td>
            <td style="text-align:right;color:#6b665f;">${Number(order.shipping) === 0 ? 'FREE' : `${order.currency} ${Number(order.shipping || 0).toFixed(2)}`}</td>
          </tr>
          ${Number(order.discount) > 0 ? `
          <tr>
            <td style="color:#a66a3f;">Promotional Discount</td>
            <td style="text-align:right;color:#a66a3f;">-${order.currency} ${Number(order.discount).toFixed(2)}</td>
          </tr>` : ''}
          <tr class="total-row">
            <td>Total</td>
            <td style="text-align:right;">${order.currency} ${Number(order.total || 0).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="p">
      <strong>Payment Status:</strong> ${order.payment_status?.toUpperCase() || 'PENDING'}<br>
      <strong>Payment Method:</strong> ${order.payment_method?.toUpperCase() || 'ONLINE'}
    </p>
    <p class="p" style="font-size:12px;color:#8c827a;">
      You can review your order status anytime at our online atelier using order number <strong>${order.order_number}</strong>.
    </p>
  `;

  return baseEmailLayout({
    title: `Order Received #${order.order_number} – JAB LEATHER`,
    preheader: `We have received your order #${order.order_number}. Our artisans are reviewing your commission.`,
    content,
  });
}

function paymentConfirmedTemplate(order, payment = {}) {
  const customerName = order.customer?.name || order.customer?.firstName || 'Valued Customer';
  const content = `
    <h2 class="h1">Payment Confirmed – #${order.order_number}</h2>
    <p class="p">Dear ${customerName},</p>
    <p class="p">We have successfully verified and confirmed your payment for order <strong>#${order.order_number}</strong>. Your jacket is now entering bench crafting and final finishing.</p>
    
    <div class="order-box">
      <p style="margin: 0 0 8px; font-size: 13px;"><strong>Amount Paid:</strong> ${order.currency} ${Number(payment.amount || order.total || 0).toFixed(2)}</p>
      <p style="margin: 0 0 8px; font-size: 13px;"><strong>Payment Provider:</strong> ${(payment.provider || order.payment_method || 'Sandbox').toUpperCase()}</p>
      <p style="margin: 0 0 8px; font-size: 13px;"><strong>Transaction Reference:</strong> ${payment.reference || order.payment_reference || 'N/A'}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Confirmation Date:</strong> ${new Date().toUTCString()}</p>
    </div>

    <p class="p">
      Our master craftsmen will inspect, oil-condition, and pack your leather order in protective heritage dust covers before international courier dispatch.
    </p>
  `;

  return baseEmailLayout({
    title: `Payment Confirmed #${order.order_number} – JAB LEATHER`,
    preheader: `Payment for order #${order.order_number} has been confirmed. Crafting is underway.`,
    content,
  });
}

function orderShippedTemplate(order, trackingInfo = {}) {
  const customerName = order.customer?.name || order.customer?.firstName || 'Valued Customer';
  const content = `
    <h2 class="h1">Dispatched from Sialkot Atelier – #${order.order_number}</h2>
    <p class="p">Dear ${customerName},</p>
    <p class="p">Your handcrafted leather order has passed final quality inspection and has been dispatched via international priority air courier.</p>
    
    <div class="order-box">
      <p style="margin: 0 0 8px; font-size: 13px;"><strong>Courier Partner:</strong> ${trackingInfo.carrier || 'DHL Express / FedEx Air'}</p>
      <p style="margin: 0 0 8px; font-size: 13px;"><strong>Airway Bill (Tracking #):</strong> ${trackingInfo.trackingNumber || 'Available shortly'}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Estimated Delivery:</strong> ${trackingInfo.estimatedDelivery || '5–8 business days'}</p>
    </div>

    <p class="p">
      Please ensure someone is available at the delivery destination to inspect and sign for the leather consignment.
    </p>
  `;

  return baseEmailLayout({
    title: `Order Shipped #${order.order_number} – JAB LEATHER`,
    preheader: `Your order #${order.order_number} has been dispatched from Sialkot with international tracking.`,
    content,
  });
}

module.exports = {
  orderReceivedTemplate,
  paymentConfirmedTemplate,
  orderShippedTemplate,
};
