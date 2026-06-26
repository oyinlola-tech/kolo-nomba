# Problem & Solution

## The Problem

### Informal Savings in Africa

Traditional Ajo and Esusu savings systems are deeply embedded in African culture. Members contribute a fixed amount to a communal pool at regular intervals, and one member receives the entire pot in rotation. While these systems work, they face critical challenges:

### Challenges with Manual Ajo/Esusu

1. **Cash Handling Risks** — Physical cash can be lost, stolen, or miscounted. There's no digital trail.
2. **Trust Issues** — No transparent record of who paid and who hasn't. Disputes are common.
3. **Payout Delays** — Distributing the pot requires the group admin to physically visit each member.
4. **No Credit History** — Participation in Ajo doesn't build financial history or credit scores.
5. **Limited Scale** — Groups are limited to people who know and trust each other physically.
6. **No Automation** — Reminders, tracking, and reconciliation are all manual overhead.

### For Cooperatives

- **Complex Accounting** — Tracking contributions across dozens of members is error-prone.
- **Delayed Payouts** — Manual approval and transfer processes slow down distributions.
- **Lack of Visibility** — Members don't have real-time insight into group finances.

## The Solution: Kolo

### What Kolo Does

Kolo digitizes the entire cooperative savings lifecycle — from group formation and member management to contribution tracking, payment processing, and automated payouts.

### How Kolo Solves Each Problem

| Problem | Kolo Solution |
|---|---|
| Cash handling risks | Digital payments via Nomba (bank transfer, USSD, card) |
| Trust issues | Real-time double-entry ledger with full audit trail |
| Payout delays | Automated bulk payouts with approval workflows |
| No credit history | Transaction records can serve as financial proof |
| Limited scale | Cloud-based platform accessible from any device |
| Manual overhead | Automated reminders, reconciliation, and reports |

### Key Innovations

1. **Atomic Wallet Operations** — All monetary operations use database-level atomic increments/decrements to prevent race conditions and double-spending.

2. **Device-Aware Authentication** — Login from an unknown device triggers an email OTP challenge, adding a critical security layer without requiring a mobile app.

3. **Role-Based Multi-Tenancy** — Clean separation between platform admin, group admin, and member concerns with distinct dashboards and permissions.

4. **Double-Entry Ledger** — Every financial transaction is recorded with equal credits and debits, ensuring accounting integrity.

5. **Provider-Agnostic Payment Integration** — Nomba integration with plans to support additional providers, all behind a unified payment interface.

6. **Webhook-Driven Reconciliation** — Payment status is never trusted from the frontend; all confirmations come through signed Nomba webhooks with duplicate detection.

### Target Impact

- **Reduce contribution defaults** by 40% through automated reminders
- **Eliminate cash handling** incidents 
- **Speed up payouts** from days to minutes
- **Provide financial transparency** to all members in real-time
- **Enable cooperatives** to scale from 10 to 10,000+ members
