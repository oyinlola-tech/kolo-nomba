# Kolo Notification System

## Overview

Kolo's notification system provides multi-channel communication for all platform events. Every important user action generates clear communication through configurable channels.

## Architecture

```
Business Event
    ↓
Event Handler (notification.handler.ts)
    ↓
Notification Service (notification.service.ts)
    ↓
Channel Resolver (channel-resolver.ts)
    ↓
  ┌──────┬──────┬──────┐
  │      │      │      │
Email   SMS  WhatsApp  In-App
Provider Provider Provider (always)
```

## Supported Channels

| Channel   | Env Variable                      | Default | Overridable by user |
|-----------|-----------------------------------|---------|---------------------|
| In-App    | Always enabled                    | ON      | No                  |
| Email     | `ENABLE_EMAIL_NOTIFICATIONS`      | true    | Yes                 |
| SMS       | `ENABLE_SMS_NOTIFICATIONS`        | false   | Yes                 |
| WhatsApp  | `ENABLE_WHATSAPP_NOTIFICATIONS`   | false   | Yes                 |

### Channel Rules

- If `ENABLE_EMAIL_NOTIFICATIONS=true` → send email.
- If `ENABLE_SMS_NOTIFICATIONS=true` → send SMS.
- If `ENABLE_SMS_NOTIFICATIONS=false` → never attempt SMS delivery.
- If `ENABLE_WHATSAPP_NOTIFICATIONS=false` → never attempt WhatsApp delivery.
- Security (`SECURITY`), payment (`PAYMENT`), and payout (`PAYOUT`) notification types **always** send email regardless of user preference.
- **In-App** notifications are always created for every event.

## Environment Variables

### Channel Toggles

| Variable                          | Type    | Default | Description              |
|-----------------------------------|---------|---------|--------------------------|
| `ENABLE_EMAIL_NOTIFICATIONS`      | boolean | true    | Master email toggle      |
| `ENABLE_SMS_NOTIFICATIONS`        | boolean | false   | Master SMS toggle        |
| `ENABLE_WHATSAPP_NOTIFICATIONS`   | boolean | false   | Master WhatsApp toggle   |

### SMTP Configuration

| Variable          | Default             | Description              |
|-------------------|---------------------|--------------------------|
| `SMTP_HOST`       | localhost           | SMTP server host         |
| `SMTP_PORT`       | 587                 | SMTP server port         |
| `SMTP_USER`       | (empty)             | SMTP username            |
| `SMTP_PASSWORD`   | (empty)             | SMTP password            |
| `SMTP_FROM_EMAIL` | noreply@kolo.app    | From email address       |
| `SMTP_FROM_NAME`  | Kolo                | From display name        |

### SMS Configuration

| Variable        | Default | Description          |
|-----------------|---------|----------------------|
| `SMS_PROVIDER`  | (empty) | SMS provider name    |
| `SMS_API_KEY`   | (empty) | SMS API key          |
| `SMS_API_SECRET`| (empty) | SMS API secret       |

### WhatsApp Configuration

| Variable             | Default | Description               |
|----------------------|---------|---------------------------|
| `WHATSAPP_PROVIDER`  | (empty) | WhatsApp provider name    |
| `WHATSAPP_API_KEY`   | (empty) | WhatsApp API key          |

### Delivery Retry

| Variable              | Default | Description                    |
|-----------------------|---------|--------------------------------|
| `EMAIL_MAX_RETRIES`   | 3       | Max delivery retry attempts    |
| `EMAIL_RETRY_DELAY`   | 60000   | Delay between retries (ms)     |

## Event Triggers & Email Templates

| Event Name                    | Template Name            | Recipient          | Description                        |
|-------------------------------|--------------------------|--------------------|------------------------------------|
| `user.registered`             | welcome                  | User               | Welcome to Kolo                    |
| `user.verification_required`  | accountVerification      | User               | Account verification code          |
| `password.changed`            | passwordChanged          | User               | Password change confirmation       |
| `user.login_success`          | newLoginAlert            | User               | New login detected                 |
| `group.created`               | groupCreated             | Admin              | Group created confirmation         |
| `group.member_invited`        | groupInvitation          | Invited member     | Group invitation details           |
| `contribution.reminder`       | contributionReminder     | Member             | Contribution due reminder          |
| `contribution.received`       | contributionSuccessful   | Member             | Contribution received confirmation |
| `contribution.overdue`        | contributionOverdue      | Member             | Overdue contribution notice        |
| `payment.successful`          | paymentSuccessful        | User               | Payment receipt                    |
| `payment.failed`              | paymentFailed            | User               | Payment failure notice             |
| `payment.large_transaction`   | paymentSuccessful        | Super Admin        | Large transaction alert            |
| `payout.requested`            | payoutRequested          | Group Admins       | Payout approval request            |
| `payout.completed`            | payoutCompleted          | Beneficiary        | Payout confirmed                   |
| `security.suspicious_login`   | securityAlert            | User               | Suspicious login alert             |
| `security.system_alert`       | securityAlert            | Super Admin        | System security alert              |

## Template Features

Each email template includes:

- Modern fintech design with white background
- Kolo branding with emerald green (#059669) accent
- Professional typography
- Clear CTA buttons
- Transaction summary cards for financial notifications
- Plain text fallback
- Footer with support email, privacy & terms links

## User Notification Preferences

Users can control delivery channels via `PATCH /api/v1/notifications/preferences`:

```json
{
  "emailEnabled": true,
  "smsEnabled": false,
  "whatsappEnabled": false,
  "pushEnabled": true,
  "securityAlerts": true,
  "paymentAlerts": true,
  "marketingMessages": false
}
```

**Important:** Security and payment alerts cannot be completely disabled — they always send email regardless of user preference.

## Delivery Tracking

Every outbound channel delivery is recorded in the `NotificationDelivery` model:

| Field              | Description                         |
|--------------------|-------------------------------------|
| id                 | Unique delivery ID                  |
| notificationId     | Parent notification reference       |
| channel            | EMAIL, SMS, or WHATSAPP             |
| status             | PENDING, SENT, or FAILED            |
| provider           | Provider name (e.g., smtp, twilio)  |
| providerReference  | External provider message ID        |
| attempts           | Number of delivery attempts         |
| failureReason      | Error message if failed             |
| sentAt             | Timestamp of successful send        |

### Delivery Status Endpoints

- `GET /api/v1/notifications/:notificationId/deliveries` — Get delivery records for a notification
- `POST /api/v1/notifications/retry-failed` — Manually trigger retry of failed deliveries

## Retry System

The retry system is built into `NotificationService.retryFailedDeliveries()`:

1. Queries deliveries with `FAILED` status where `attempts < EMAIL_MAX_RETRIES`
2. Resets status to `PENDING`
3. Re-attempts delivery through the appropriate channel provider
4. Updates delivery record with success or failure
5. Returns count of successfully retried deliveries

Configured via:
- `EMAIL_MAX_RETRIES` (default: 3)
- `EMAIL_RETRY_DELAY` (default: 60000ms)

## Adding a New Provider

1. Create a provider interface in `src/integrations/<channel>/` (e.g., `sms-provider.interface.ts`)
2. Implement the interface (e.g., `twilio-sms.provider.ts`, `disabled-sms.provider.ts`)
3. Add the provider to `channel-resolver.ts` or use it in `notification.service.ts`
4. For SMS/WhatsApp, ensure the master toggle exists in `.env`

## Adding a New Template

1. Add a method in `EmailTemplateService` that returns `{ subject, html, text }`
2. Register it in the `getTemplate` map
3. If triggered by an event, add the handler in `notification.handler.ts`
4. Map the event's payload to template variables

## Security Rules

- Passwords are never logged
- SMTP credentials are never logged
- Security notifications are always sent regardless of user preference
- Super admin accounts are only created through `prisma/seed.ts`, never through registration
