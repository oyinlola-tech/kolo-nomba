# Business Model

Kolo operates on a **freemium SaaS model** with transaction-based revenue. The platform generates revenue through subscription fees and per-transaction charges.

---

## Revenue Streams

### 1. Platform Subscription Fees

Groups pay a monthly subscription based on their size and feature requirements:

| Plan | Price | Target |
|---|---|---|
| Free | ₦0 | Small groups (up to 10 members, basic features) |
| Growth | ₦9,500/month | Medium groups with advanced features |
| Enterprise | Custom | Large cooperatives with dedicated support |

### 2. Transaction Fees

Kolo charges a **1% fee** on successful contributions, capped at a maximum of ₦2,000 per transaction. This fee is deducted automatically during payment processing.

- **Fee calculation**: `fee = min(amount × 0.01, 2000)`
- **Fee deduction**: The full contribution amount is credited to the group wallet; the platform fee is credited to the platform wallet.
- **Transparency**: Fees are displayed before payment confirmation.

### 3. Payout Processing Fees

Bulk payout processing includes a nominal per-transaction fee for transfers processed through Nomba.

---

## Fee Architecture

```
Member Payment (₦10,000)
        │
        ▼
  Nomba Payment Gateway
        │
        ▼
  Payment Verification (Webhook)
        │
        ▼
  Fee Calculation
  │  fee = min(10,000 × 0.01, 2000) = ₦100
  │
  ├── Group Wallet: ₦9,900 (contribution - fee)
  └── Platform Wallet: ₦100 (fee revenue)
```

### Fee Application
- Fees apply only to **successful** contributions
- Failed or refunded payments do not incur fees
- Group-to-member payouts are fee-free
- External bank transfers may include Nomba processing fees

---

## Value Proposition by Customer Segment

### Small Groups (Free Plan)
- Digital contribution tracking
- Basic member management
- Email notifications
- Manual payout processing

### Growing Cooperatives (Growth Plan)
- Everything in Free, plus:
- Automated payout scheduling
- Bulk transfer processing
- Advanced reporting
- Priority support
- Custom contribution rules

### Large Enterprises (Enterprise Plan)
- Everything in Growth, plus:
- Dedicated account manager
- Custom integration support
- SLA guarantees
- White-label options
- API rate limit increases

---

## Unit Economics

### Cost Structure
- **Infrastructure**: Cloud hosting, database, Redis
- **Payment Processing**: Nomba transaction fees
- **Email Delivery**: SMTP provider costs
- **Engineering**: Development and maintenance

### Margin Drivers
- **Scale**: Fixed infrastructure costs spread across growing user base
- **Automation**: Minimal manual intervention required
- **Self-service**: Free and Growth plans are fully self-service
- **Low churn**: Cooperative savings have long lifecycles (6-24 month plans)

---

## Go-to-Market Strategy

1. **Community-led Growth**: Target existing Ajo/Esusu groups through community ambassadors
2. **Cooperative Partnerships**: Partner with registered cooperatives for bulk onboarding
3. **Referral Program**: Existing groups get premium features for referring new groups
4. **Freemium Conversion**: Free groups naturally upgrade as they grow and need more features
