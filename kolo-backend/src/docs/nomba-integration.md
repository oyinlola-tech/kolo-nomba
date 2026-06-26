# Nomba Payment Integration

## Account Structure

Kolo uses Nomba parent account and sub account architecture.

- **Parent Account ID**: Used in `accountId` header for all API requests
- **Sub Account ID**: Scopes Kolo operations within Nomba

## Environment Variables

```env
NOMBA_ENVIRONMENT=test|live

NOMBA_PARENT_ACCOUNT_ID=
NOMBA_SUB_ACCOUNT_ID=

NOMBA_TEST_CLIENT_ID=
NOMBA_TEST_PRIVATE_KEY=

NOMBA_LIVE_CLIENT_ID=
NOMBA_LIVE_PRIVATE_KEY=

NOMBA_BASE_URL=
NOMBA_WEBHOOK_URL=
NOMBA_WEBHOOK_SECRET=
```

Credentials are selected based on `NOMBA_ENVIRONMENT`. In production, LIVE credentials are required; in test, TEST credentials are required.

## Architecture

```
integrations/nomba/
├── nomba.auth.ts          - Authentication & token caching
├── nomba.client.ts        - Reusable HTTP client
├── nomba.payment.ts       - Payment operations
├── nomba.transfer.ts      - Transfer operations
├── nomba.virtual-account.ts - Virtual account operations
└── nomba.webhook.ts       - Webhook signature verification
```

### Authentication Flow

1. `NombaAuthService.getAccessToken()` checks Redis cache
2. If no cached token, calls `POST /auth/token` with client credentials
3. Token is cached with TTL from response (minus 60s safety margin)
4. On 401 response, client auto-refreshes token and retries

### Payment Flow

```
Member → Kolo Frontend → Kolo Backend → Nomba Payment API
                                            ↓
                                     Customer Payment
                                            ↓
                                     Nomba Webhook
                                            ↓
                                     Kolo Processing
                                            ↓
                                     Contribution Completed
```

### Webhook Processing

```
Nomba → Webhook Controller → Validate Signature → Store Event → Return 200
                                                                    ↓
                                                              Redis Queue
                                                                    ↓
                                                              Webhook Worker
                                                                    ↓
                                                              Business Logic
```

## Services

### Layer 1: Integration Layer (`src/integrations/nomba/`)

- `nomba.auth.ts` - Handles token generation, caching, and refresh
- `nomba.client.ts` - Generic HTTP client with auth headers, retries, error handling
- `nomba.payment.ts` - Payment initiation, verification, transaction lookup
- `nomba.transfer.ts` - Transfer creation, status checking, verification
- `nomba.virtual-account.ts` - Virtual account CRUD operations
- `nomba.webhook.ts` - HMAC-SHA256 signature verification with timestamp validation

### Layer 2: Service Layer (`src/services/`)

- `nomba.service.ts` - Facade that aggregates all Nomba integration components
- `payment.service.ts` - Orchestrates payment flow, wallet credit, notifications
- `webhook.service.ts` - Handles webhook storage, deduplication, and processing
- `transfer.service.ts` - Manages transfer initiation and status monitoring
- `virtual-account.service.ts` - Manages virtual account lifecycle
- `payout.service.ts` - Manages payout approval and execution

### Layer 3: Background Jobs (`src/jobs/processors/`)

- `payment.processor.ts` - Verifies and retries payments
- `webhook.processor.ts` - Processes stored webhook events
- `payout.processor.ts` - Processes payouts, checks transfer status, retries failures
- `reconciliation.processor.ts` - Syncs Nomba transactions, matches records, generates reports

## Security

- All API requests include `Authorization: Bearer` and `accountId` headers
- Private keys never exposed after authentication
- Webhook signatures verified using HMAC-SHA256 with timing-safe comparison
- Duplicate webhook prevention via event ID, signature, and payload checks
- Idempotency enforced through database constraints and status checks
- Tokens cached in Redis with automatic refresh

## Admin Monitoring

Available to SUPER_ADMIN at `/api/v1/admin/nomba/*`:

| Endpoint | Description |
|----------|-------------|
| `GET /admin/nomba/status` | Connection status and configuration |
| `GET /admin/nomba/transactions` | Nomba payment transactions |
| `GET /admin/nomba/webhook-events` | Webhook event history |
| `GET /admin/nomba/failed-payments` | Failed payment records |
| `GET /admin/nomba/reconciliation` | Reconciliation results |

## Reconciliation

The reconciliation system compares Nomba provider records against Kolo internal records:

1. `SYNC_TRANSACTIONS` job fetches Nomba transactions and creates reconciliation records
2. `MATCH_TRANSACTIONS` job matches pending records against internal transactions
3. `GENERATE_REPORT` job generates reconciliation summary reports

## Testing

Run Nomba integration tests:

```bash
npx vitest run src/services/__tests__/nomba-integration.test.ts
```

Test coverage includes:
- Authentication token generation and caching
- Webhook signature validation (valid, invalid, missing)
- API client header construction
- Payment initiation and verification
- Virtual account creation
- Transfer initiation, success, and failure
- Reconciliation processing
- Service facade status and connection checks
