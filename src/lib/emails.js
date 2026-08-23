const contact = 'connect@devgenit.com | WhatsApp: +8801581491903';
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));

export function dueSoonEmail({ clientName, serviceName, amount, daysRemaining, dueDate }) {
  return { subject: `Payment reminder — ${serviceName} due in ${daysRemaining} days`, html: `<p>Hello ${escapeHtml(clientName)},</p><p>Your payment of <strong>$${escapeHtml(amount)}</strong> for <strong>${escapeHtml(serviceName)}</strong> is due in ${daysRemaining} days, on ${escapeHtml(dueDate)}.</p><p>Please contact us with any questions.</p><p>${contact}</p>` };
}

export function serviceBlockedEmail({ clientName, serviceName, amountOwed }) {
  return { subject: `${serviceName} has been suspended`, html: `<p>Hello ${escapeHtml(clientName)},</p><p>Your service <strong>${escapeHtml(serviceName)}</strong> has been suspended because payment remains overdue. The amount currently owed is <strong>$${escapeHtml(amountOwed)}</strong>.</p><p>Contact us to arrange payment and restore the service.</p><p>${contact}</p>` };
}

export function paymentReceivedEmail({ clientName, serviceName, amountPaid, invoiceNumber, nextDueDate, receiptUrl }) {
  return { subject: `Payment received — invoice ${invoiceNumber}`, html: `<p>Hello ${escapeHtml(clientName)},</p><p>We received your payment of <strong>$${escapeHtml(amountPaid)}</strong> for <strong>${escapeHtml(serviceName)}</strong>.</p><p>Invoice: <strong>${escapeHtml(invoiceNumber)}</strong><br />Next due date: <strong>${escapeHtml(nextDueDate || 'No fixed schedule')}</strong></p>${receiptUrl ? `<p><a href="${escapeHtml(receiptUrl)}">Download receipt</a></p>` : ''}<p>${contact}</p>` };
}

export async function sendEmail({ to, template }) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error('Resend email is not configured');
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({ from: process.env.EMAIL_FROM, to, subject: template.subject, html: template.html });
  if (result.error) throw new Error(result.error.message);
  return result.data;
}