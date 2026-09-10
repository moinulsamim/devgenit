const WHATSAPP_GRAPH_VERSION =
  process.env.WHATSAPP_GRAPH_VERSION || 'v23.0';

const WHATSAPP_PHONE_NUMBER_ID =
  process.env.WHATSAPP_PHONE_NUMBER_ID;

const WHATSAPP_ACCESS_TOKEN =
  process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Check whether WhatsApp Cloud API is configured.
 */
export function isWhatsAppConfigured() {
  return Boolean(
    WHATSAPP_PHONE_NUMBER_ID &&
      WHATSAPP_ACCESS_TOKEN
  );
}

/**
 * Send a plain text WhatsApp message.
 *
 * @param {string} to - Recipient phone number in international format.
 * @param {string} body - Message text.
 */
export async function sendWhatsAppText(to, body) {
  if (!isWhatsAppConfigured()) {
    throw new Error(
      'WhatsApp Cloud API is not configured. Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN.'
    );
  }

  if (!to) {
    throw new Error('WhatsApp recipient phone number is required.');
  }

  if (!body) {
    throw new Error('WhatsApp message body is required.');
  }

  // WhatsApp expects the phone number without spaces,
  // brackets, hyphens, or a leading "+".
  const recipient = String(to).replace(/\D/g, '');

  if (!recipient) {
    throw new Error('Invalid WhatsApp recipient phone number.');
  }

  const url =
    `https://graph.facebook.com/${WHATSAPP_GRAPH_VERSION}/` +
    `${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'text',
      text: {
        preview_url: false,
        body,
      },
    }),
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.error?.message ||
      `WhatsApp API request failed with status ${response.status}.`;

    const error = new Error(errorMessage);

    // Keep the original API response available for logging/debugging.
    error.whatsappResponse = data;

    throw error;
  }

  return {
    success: true,
    messageId: data?.messages?.[0]?.id || null,
    contacts: data?.contacts || [],
    response: data,
  };
}

/**
 * Send a WhatsApp message using a template.
 *
 * This is useful when WhatsApp requires a template message
 * outside the normal customer-service conversation window.
 *
 * @param {string} to
 * @param {string} templateName
 * @param {string} languageCode
 * @param {Array} parameters
 */
export async function sendWhatsAppTemplate(
  to,
  templateName,
  languageCode = 'en_US',
  parameters = []
) {
  if (!isWhatsAppConfigured()) {
    throw new Error(
      'WhatsApp Cloud API is not configured. Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN.'
    );
  }

  if (!to) {
    throw new Error('WhatsApp recipient phone number is required.');
  }

  if (!templateName) {
    throw new Error('WhatsApp template name is required.');
  }

  const recipient = String(to).replace(/\D/g, '');

  if (!recipient) {
    throw new Error('Invalid WhatsApp recipient phone number.');
  }

  const url =
    `https://graph.facebook.com/${WHATSAPP_GRAPH_VERSION}/` +
    `${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const components =
    parameters.length > 0
      ? [
          {
            type: 'body',
            parameters: parameters.map((value) => ({
              type: 'text',
              text: String(value),
            })),
          },
        ]
      : [];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        ...(components.length > 0 ? { components } : {}),
      },
    }),
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.error?.message ||
      `WhatsApp template request failed with status ${response.status}.`;

    const error = new Error(errorMessage);

    error.whatsappResponse = data;

    throw error;
  }

  return {
    success: true,
    messageId: data?.messages?.[0]?.id || null,
    contacts: data?.contacts || [],
    response: data,
  };
}