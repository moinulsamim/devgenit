import { NextResponse } from 'next/server';
import crypto from 'crypto';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

/**
 * WhatsApp webhook verification.
 *
 * Meta sends:
 * hub.mode
 * hub.verify_token
 * hub.challenge
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (
    mode === 'subscribe' &&
    token &&
    VERIFY_TOKEN &&
    token === VERIFY_TOKEN
  ) {
    return new Response(challenge, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  return NextResponse.json(
    {
      error: 'Webhook verification failed.',
    },
    {
      status: 403,
    }
  );
}

/**
 * Verify Meta's X-Hub-Signature-256 header.
 */
function verifyWebhookSignature(rawBody, signatureHeader) {
  if (!APP_SECRET) {
    return false;
  }

  if (!signatureHeader) {
    return false;
  }

  const [algorithm, receivedSignature] =
    signatureHeader.split('=');

  if (algorithm !== 'sha256' || !receivedSignature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', APP_SECRET)
    .update(rawBody, 'utf8')
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * WhatsApp webhook receiver.
 *
 * Meta sends incoming messages and delivery/read status updates here.
 */
export async function POST(request) {
  try {
    const rawBody = await request.text();

    const signature =
      request.headers.get('x-hub-signature-256');

    /*
     * Production security:
     * When APP_SECRET is configured, require a valid
     * Meta webhook signature.
     */
    if (APP_SECRET) {
      const valid = verifyWebhookSignature(
        rawBody,
        signature
      );

      if (!valid) {
        return NextResponse.json(
          {
            error: 'Invalid webhook signature.',
          },
          {
            status: 401,
          }
        );
      }
    }

    let payload;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid JSON payload.',
        },
        {
          status: 400,
        }
      );
    }

    /*
     * WhatsApp Cloud API webhook payloads are normally:
     *
     * {
     *   object: "whatsapp_business_account",
     *   entry: [...]
     * }
     */

    if (
      payload?.object !== 'whatsapp_business_account'
    ) {
      return NextResponse.json(
        {
          received: true,
        },
        {
          status: 200,
        }
      );
    }

    const entries = Array.isArray(payload.entry)
      ? payload.entry
      : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry.changes)
        ? entry.changes
        : [];

      for (const change of changes) {
        if (change?.field !== 'messages') {
          continue;
        }

        const value = change?.value;

        if (!value) {
          continue;
        }

        /*
         * Incoming messages.
         */
        const messages = Array.isArray(value.messages)
          ? value.messages
          : [];

        for (const message of messages) {
          const sender = message?.from || null;
          const messageId = message?.id || null;
          const messageType = message?.type || null;

          let text = null;

          if (messageType === 'text') {
            text = message?.text?.body || null;
          }

          /*
           * For now we only acknowledge/process the webhook.
           *
           * Later we can connect this to:
           * - Client lookup
           * - automated replies
           * - payment status
           * - subscription information
           * - support commands
           */
          console.log(
            '[WhatsApp] Incoming message',
            {
              sender,
              messageId,
              messageType,
              text,
            }
          );
        }

        /*
         * Message status updates:
         *
         * sent
         * delivered
         * read
         * failed
         */
        const statuses = Array.isArray(value.statuses)
          ? value.statuses
          : [];

        for (const status of statuses) {
          console.log(
            '[WhatsApp] Message status',
            {
              messageId: status?.id || null,
              status: status?.status || null,
              recipientId:
                status?.recipient_id || null,
              timestamp:
                status?.timestamp || null,
              errors: status?.errors || null,
            }
          );
        }
      }
    }

    /*
     * Meta expects a successful response.
     */
    return NextResponse.json(
      {
        received: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      '[WhatsApp Webhook Error]',
      error
    );

    /*
     * Return 200 only for successfully accepted payloads.
     * Unexpected server errors should remain visible to Meta
     * so delivery can be retried.
     */
    return NextResponse.json(
      {
        error: 'Webhook processing failed.',
      },
      {
        status: 500,
      }
    );
  }
}