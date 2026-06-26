# Demo Guide

This guide walks through a complete Kolo demo scenario — from setting up a savings group to making contributions and processing a payout.

---

## Demo Story

**The Scenario:** A group of friends in Lagos want to save money together using the traditional Ajo system. They've heard about Kolo and decide to try it.

**Characters:**

| Name | Role | Email |
|---|---|---|
| Chioma | Group Admin | chioma@example.com |
| Ada | Member | ada@example.com |
| Emeka | Member | emeka@example.com |
| Tunde | Member | tunde@example.com |

---

## Step 1: Chioma Creates an Account

1. Chioma visits Kolo and clicks **"Get Started"**
2. She fills in the registration form:
   - First Name: Chioma
   - Last Name: Okafor
   - Email: chioma@example.com
   - Phone: +2348012345678
   - Password: ********
3. She clicks **"Create Account"**
4. Kolo sends a 6-digit verification code to chioma@example.com
5. Chioma enters the code on the OTP verification page
6. Her account is activated and she's redirected to the member dashboard

---

## Step 2: Chioma Creates a Savings Group

1. From the dashboard, Chioma navigates to **"Create Group"**
2. She enters:
   - Group Name: "Lagos Savings Circle"
   - Description: "Weekly savings for our annual trip"
   - Category: "Social"
3. She clicks **"Create Group"**
4. The group is created and Chioma is now both a member and admin

---

## Step 3: Chioma Creates a Contribution Plan

1. From the group admin dashboard, Chioma selects **"Create Contribution Plan"**
2. She configures:
   - Amount per member: ₦5,000
   - Frequency: Weekly
   - Duration: 12 weeks
   - Name: "Trip Fund Q4"
3. She clicks **"Create Plan"**
4. Kolo generates 12 contribution cycles automatically

---

## Step 4: Chioma Invites Members

1. Chioma navigates to **"Members"** → **"Invite"**
2. She enters the email addresses of Ada, Emeka, and Tunde
3. She clicks **"Send Invitations"**
4. Each member receives an email invitation with a link to join

---

## Step 5: Members Join the Group

**Ada's experience:**
1. Ada clicks the invitation link in her email
2. If she already has a Kolo account, she's taken to the group page
3. If she's new, she registers first, then is added to the group
4. She can see the contribution plan, expected amounts, and due dates

---

## Step 6: First Contribution Cycle Begins

1. Kolo automatically opens Cycle 1 (Week 1: Oct 1–7)
2. All members receive an in-app notification: **"Your ₦5,000 contribution is due"**
3. Chioma (as admin) can see the payment status of each member on the dashboard

---

## Step 7: Ada Makes a Contribution

1. Ada opens the Kolo app and navigates to **"Make Payment"**
2. She sees her pending contribution of ₦5,000
3. She selects **"Pay Now"**
4. She chooses a payment method — **"Bank Transfer"**
5. Kolo generates a virtual account number: **0123456789 (Providus Bank)**
6. Ada transfers ₦5,000 to that account from her banking app
7. Nomba detects the incoming transfer and sends a webhook to Kolo
8. Kolo verifies the webhook signature, records the payment, and credits the group wallet

---

## Step 8: Emeka and Tunde Pay

1. Both members repeat the process
2. Emeka uses **Card Payment** — enters card details on the Nomba checkout page
3. Tunde uses **Nomba Wallet** — pays from his Nomba balance
4. All three payments are recorded and visible on the group dashboard

---

## Step 9: Chioma Monitors Progress

1. Chioma opens the **group admin dashboard**
2. She sees:
   - **Total collected**: ₦15,000 (3 of 4 members paid)
   - **Pending**: Tunde's ₦5,000
   - **Cycle status**: 1 of 12 complete
3. She sends a reminder to Tunde from the dashboard

---

## Step 10: Chioma Processes a Payout

At the end of the cycle, the group decides to rotate payouts:

1. Chioma navigates to **"Payouts"** → **"Create Payout"**
2. She selects:
   - Recipient: Ada
   - Amount: ₦15,000 (the full cycle pot minus platform fee)
   - Reason: "Cycle 1 payout"
3. She clicks **"Create Payout"**
4. Ada receives an in-app notification: **"Payout of ₦14,850 initiated"**
5. Chioma approves and processes the payout
6. Kolo initiates a Nomba transfer to Ada's saved bank account
7. Ada receives the money and a receipt via email

---

## Step 11: Check Reports

1. Chioma views the **group report** showing:
   - Total contributions collected
   - Payouts made
   - Member payment history
   - Platform fees deducted
2. Each member can view their **personal transaction history**

---

## Step 12: Repeat

The group continues through all 12 cycles:
- Members receive reminders each week
- Contributions are tracked automatically
- Payouts rotate to the next member
- Reports update in real-time

At the end, each member has saved ₦60,000 (₦5,000 × 12) and received one payout of ~₦59,400.

---

## What Makes Kolo Special

1. **No Cash Handling** — Everything is digital
2. **Transparency** — Every transaction visible to all members
3. **Automation** — Reminders, cycle management, and payouts
4. **Trust** — Audit trail and webhook-verified payments
5. **Security** — OTP challenges, encrypted sessions, rate limiting
6. **Scale** — Groups of any size, from 5 to 5,000 members
