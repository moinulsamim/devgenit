import { getPrisma } from '../../../../lib/prisma';
import { logAdminAction } from '../../../../lib/audit';
import {
  dueSoonEmail,
  sendEmail,
  serviceBlockedEmail,
} from '../../../../lib/emails';
import {
  sendWhatsAppText,
  sendWhatsAppTemplate,
  isWhatsAppConfigured,
} from '../../../../lib/whatsapp';

export const runtime = 'nodejs';

/**
 * The exact days on which clients receive payment reminders.
 */
const DUE_SOON_DAYS = [7, 5, 3, 2, 1];

/**
 * Send the existing due-soon email.
 */
async function sendDueSoonEmail(service, daysUntilDue) {
  const template = dueSoonEmail({
    clientName: service.client.name,
    serviceName: service.name,
    amount: service.amount,
    daysRemaining: daysUntilDue,
    dueDate: new Date(service.nextDueDate).toLocaleDateString('en-US'),
  });

  return sendEmail({
    to: service.client.email,
    template,
  });
}

/**
 * Send the existing blocked-service email.
 */
async function sendServiceBlockedEmail(service) {
  const template = serviceBlockedEmail({
    clientName: service.client.name,
    serviceName: service.name,
    amountOwed: service.amount,
  });

  return sendEmail({
    to: service.client.email,
    template,
  });
}

/**
 * Build the WhatsApp due-soon message.
 */
function buildWhatsAppDueSoonMessage(service, daysUntilDue) {
  const dueDate = new Date(
    service.nextDueDate
  ).toLocaleDateString('en-US');

  const clientName = service.client.name;
  const amount = service.amount?.toString() || '0.00';

  return (
    `Hello ${clientName},\n\n` +
    `This is a payment reminder from DevGenit.\n\n` +
    `Service: ${service.name}\n` +
    `Amount: ${amount}\n` +
    `Due date: ${dueDate}\n\n` +
    `Your payment is due in ${daysUntilDue} day${
      daysUntilDue === 1 ? '' : 's'
    }.\n\n` +
    `Please complete your payment before the due date to avoid service interruption.\n\n` +
    `Thank you,\n` +
    `DevGenit`
  );
}

/**
 * Send the WhatsApp due-soon notification.
 *
 * If WHATSAPP_DUE_SOON_TEMPLATE is configured, an approved
 * WhatsApp template is used.
 *
 * Otherwise, a normal text message is attempted.
 *
 * IMPORTANT:
 * Meta generally requires approved templates for proactive
 * business-initiated messages outside the 24-hour customer
 * service window.
 */
async function sendDueSoonWhatsApp(service, daysUntilDue) {
  if (!service.client.phone) {
    throw new Error(
      `Client ${service.client.id} does not have a phone number.`
    );
  }

  if (!isWhatsAppConfigured()) {
    throw new Error(
      'WhatsApp is not configured.'
    );
  }

  const templateName =
    process.env.WHATSAPP_DUE_SOON_TEMPLATE;

  /*
   * Recommended production path:
   * use an approved WhatsApp template.
   *
   * Template parameters:
   * {{1}} = client name
   * {{2}} = service name
   * {{3}} = amount
   * {{4}} = days remaining
   * {{5}} = due date
   */
  if (templateName) {
    const dueDate = new Date(
      service.nextDueDate
    ).toLocaleDateString('en-US');

    return sendWhatsAppTemplate(
      service.client.phone,
      templateName,
      process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US',
      [
        service.client.name,
        service.name,
        service.amount?.toString() || '0.00',
        daysUntilDue,
        dueDate,
      ]
    );
  }

  /*
   * Fallback for development/testing.
   */
  const message = buildWhatsAppDueSoonMessage(
    service,
    daysUntilDue
  );

  return sendWhatsAppText(
    service.client.phone,
    message
  );
}

/**
 * Create a notification claim before sending.
 *
 * The unique constraint in NotificationLog prevents two
 * simultaneous cron executions from sending the same
 * notification twice.
 */
async function claimNotification(
  prisma,
  service,
  channel,
  daysUntilDue,
  dueDate
) {
  try {
    return await prisma.notificationLog.create({
      data: {
        serviceId: service.id,
        channel,
        daysBeforeDue: daysUntilDue,
        dueDate,
      },
    });
  } catch (error) {
    /*
     * P2002 = Prisma unique constraint violation.
     *
     * This means another cron execution already claimed
     * this exact notification.
     */
    if (error?.code === 'P2002') {
      return null;
    }

    throw error;
  }
}

/**
 * Send a notification while keeping the notification log
 * consistent with the result.
 */
async function sendLoggedNotification({
  prisma,
  service,
  channel,
  daysUntilDue,
  dueDate,
  sender,
}) {
  const log = await claimNotification(
    prisma,
    service,
    channel,
    daysUntilDue,
    dueDate
  );

  /*
   * Already sent/claimed by another cron execution.
   */
  if (!log) {
    return {
      sent: false,
      duplicate: true,
    };
  }

  try {
    const result = await sender();

    await prisma.notificationLog.update({
      where: {
        id: log.id,
      },
      data: {
        externalMessageId:
          result?.messageId || null,
        error: null,
      },
    });

    return {
      sent: true,
      duplicate: false,
      messageId: result?.messageId || null,
    };
  } catch (error) {
    /*
     * Remove the claim when sending fails so a later cron
     * execution can retry the notification.
     */
    try {
      await prisma.notificationLog.delete({
        where: {
          id: log.id,
        },
      });
    } catch (deleteError) {
      console.error(
        'Failed to remove failed notification log',
        deleteError
      );
    }

    throw error;
  }
}

export async function GET(request) {
  /*
   * Protect the cron endpoint.
   */
  if (
    request.headers.get('authorization') !==
    `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response(
      'Unauthorized',
      {
        status: 401,
      }
    );
  }

  /*
   * Existing behavior:
   * unless CRON_DRY_RUN is explicitly "false",
   * the cron runs in dry-run mode.
   */
  const dryRun =
    process.env.CRON_DRY_RUN !== 'false';

  const prisma = await getPrisma();

  /*
   * Get all billable services that aren't blocked.
   */
  const services = await prisma.service.findMany({
    where: {
      billingCycle: {
        not: 'NO_RESTRICTION',
      },
      status: {
        not: 'BLOCKED',
      },
    },
    include: {
      client: true,
    },
  });

  const actions = [];

  /*
   * Normalize today to midnight.
   */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const service of services) {
    if (!service.nextDueDate) {
      continue;
    }

    /*
     * Normalize due date to midnight.
     */
    const due = new Date(service.nextDueDate);
    due.setHours(0, 0, 0, 0);

    const daysUntilDue = Math.round(
      (due - today) / 86400000
    );

    /*
     * =====================================================
     * CLIENT DUE-SOON NOTIFICATIONS
     * =====================================================
     *
     * Exact schedule:
     *
     * 7 days
     * 5 days
     * 3 days
     * 2 days
     * 1 day
     *
     * No 6-day or 4-day notification.
     */
    if (DUE_SOON_DAYS.includes(daysUntilDue)) {
      actions.push({
        type: 'CLIENT_DUE_SOON_NOTIFICATION',
        serviceId: service.id,
        daysUntilDue,
      });

      if (!dryRun) {
        /*
         * -------------------------------------------------
         * EMAIL
         * -------------------------------------------------
         */
        try {
          await sendLoggedNotification({
            prisma,
            service,
            channel: 'EMAIL',
            daysUntilDue,
            dueDate: due,
            sender: () =>
              sendDueSoonEmail(
                service,
                daysUntilDue
              ),
          });

          actions.push({
            type: 'CLIENT_DUE_SOON_EMAIL_SENT',
            serviceId: service.id,
            daysUntilDue,
          });
        } catch (error) {
          console.error(
            'Due-soon email failed',
            service.id,
            error?.message
          );

          actions.push({
            type: 'CLIENT_DUE_SOON_EMAIL_FAILED',
            serviceId: service.id,
            daysUntilDue,
            error: error?.message,
          });
        }

        /*
         * -------------------------------------------------
         * WHATSAPP
         * -------------------------------------------------
         */
        if (service.client.phone) {
          try {
            const result =
              await sendLoggedNotification({
                prisma,
                service,
                channel: 'WHATSAPP',
                daysUntilDue,
                dueDate: due,
                sender: () =>
                  sendDueSoonWhatsApp(
                    service,
                    daysUntilDue
                  ),
              });

            if (result.sent) {
              actions.push({
                type: 'CLIENT_DUE_SOON_WHATSAPP_SENT',
                serviceId: service.id,
                daysUntilDue,
                messageId:
                  result.messageId || null,
              });
            } else if (result.duplicate) {
              actions.push({
                type: 'CLIENT_DUE_SOON_WHATSAPP_ALREADY_PROCESSED',
                serviceId: service.id,
                daysUntilDue,
              });
            }
          } catch (error) {
            console.error(
              'Due-soon WhatsApp failed',
              service.id,
              error?.message
            );

            actions.push({
              type: 'CLIENT_DUE_SOON_WHATSAPP_FAILED',
              serviceId: service.id,
              daysUntilDue,
              error: error?.message,
            });
          }
        } else {
          actions.push({
            type: 'CLIENT_DUE_SOON_WHATSAPP_SKIPPED_NO_PHONE',
            serviceId: service.id,
            daysUntilDue,
          });
        }
      }
    }

    /*
     * =====================================================
     * ADMIN DUE-SOON NOTIFICATION
     * =====================================================
     */
    if (daysUntilDue === 2) {
      actions.push({
        type: 'ADMIN_DUE_SOON_NOTIFICATION',
        serviceId: service.id,
      });

      if (!dryRun) {
        await logAdminAction(
          'DUE_SOON_ADMIN_ALERT',
          'Service',
          service.id,
          {
            daysUntilDue,
          }
        );
      }
    }

    /*
     * =====================================================
     * MARK SERVICE OVERDUE
     * =====================================================
     */
    if (
      daysUntilDue < 0 &&
      service.status !== 'OVERDUE'
    ) {
      actions.push({
        type: 'MARK_OVERDUE',
        serviceId: service.id,
      });

      if (!dryRun) {
        await prisma.service.update({
          where: {
            id: service.id,
          },
          data: {
            status: 'OVERDUE',
            gracePeriodStartedAt: today,
          },
        });

        await logAdminAction(
          'AUTO_MARK_OVERDUE',
          'Service',
          service.id,
          {
            nextDueDate: service.nextDueDate,
          }
        );
      }
    }

    /*
     * =====================================================
     * AUTO BLOCK AFTER 3-DAY GRACE PERIOD
     * =====================================================
     */
    if (
      service.status === 'OVERDUE' &&
      service.gracePeriodStartedAt
    ) {
      const graceStart = new Date(
        service.gracePeriodStartedAt
      );

      graceStart.setHours(0, 0, 0, 0);

      const graceDays = Math.round(
        (today - graceStart) / 86400000
      );

      if (graceDays >= 3) {
        actions.push({
          type: 'AUTO_BLOCK',
          serviceId: service.id,
        });

        if (!dryRun) {
          await prisma.service.update({
            where: {
              id: service.id,
            },
            data: {
              status: 'BLOCKED',
            },
          });

          await logAdminAction(
            'AUTO_BLOCK',
            'Service',
            service.id,
            {}
          );

          /*
           * Existing blocked-service email.
           */
          try {
            await sendServiceBlockedEmail(
              service
            );
          } catch (error) {
            console.error(
              'Blocked email failed',
              service.id,
              error?.message
            );
          }
        }
      }
    }
  }

  /*
   * Existing audit log.
   */
  await logAdminAction(
    dryRun
      ? 'CRON_DRY_RUN'
      : 'CRON_LIVE_RUN',
    'System',
    'daily-billing-check',
    {
      actions,
    }
  );

  return Response.json({
    dryRun,
    actionsCount: actions.length,
    actions,
  });
}