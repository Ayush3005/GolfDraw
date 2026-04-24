# Stripe Webhook — Local Testing Guide

## Prerequisites

- Active GolfDraw dev server running on `http://localhost:3000`
- Stripe account and `.env.local` configured with `STRIPE_SECRET_KEY`

---

## Step 1 — Install the Stripe CLI

```bash
# macOS (Homebrew)
brew install stripe/stripe-cli/stripe

# Windows (Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Or download directly: https://stripe.com/docs/stripe-cli
```

---

## Step 2 — Login to Stripe

```bash
stripe login
```

This opens a browser to authenticate your Stripe account. Follow the prompts.

---

## Step 3 — Forward webhooks to your local server

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI will print a **webhook signing secret** that looks like:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxx (^C to quit)
```

**Paste this value** into your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

Restart your dev server after updating `.env.local`.

---

## Step 4 — Run the product/price setup (first time only)

If you haven't created Stripe products yet:

```bash
npx ts-node --project tsconfig.json stripe/setup.ts
```

Copy the logged price IDs into `.env.local`:

```env
STRIPE_MONTHLY_PRICE_ID=price_xxx
STRIPE_YEARLY_PRICE_ID=price_xxx
```

---

## Step 5 — Test the full checkout flow

### Trigger a test checkout event
```bash
stripe trigger checkout.session.completed
```

### Trigger a successful renewal
```bash
stripe trigger invoice.payment_succeeded
```

### Trigger a failed payment
```bash
stripe trigger i``nvoice.payment_failed
```

### Trigger a subscription update
```bash
stripe trigger customer.subscription.updated
```

### Trigger a cancellation
```bash
stripe trigger customer.subscription.deleted
```

---

## Step 6 — Watch the terminal

The Stripe CLI terminal shows every event it forwards:

```
2026-04-22 20:00:00   --> checkout.session.completed [evt_xxx]
2026-04-22 20:00:00  <-- [200] POST http://localhost:3000/api/stripe/webhook
```

Your Next.js terminal shows handler logs for any errors.

---

## Stripe test card numbers

| Scenario          | Card number         |
|-------------------|---------------------|
| Success           | 4242 4242 4242 4242 |
| Requires 3DS auth | 4000 0025 0000 3155 |
| Card declined     | 4000 0000 0000 9995 |

Use any future expiry (e.g. `12/34`) and any 3-digit CVC.

---

## Common issues

| Problem | Fix |
|---------|-----|
| `Invalid webhook signature` | Make sure `STRIPE_WEBHOOK_SECRET` is the CLI-printed secret, not the Stripe Dashboard secret |
| `400 Missing stripe-signature` | Check the route is not being parsed by middleware — `/api/*` must be excluded from the matcher |
| `500 Webhook secret not configured` | Add `STRIPE_WEBHOOK_SECRET` to `.env.local` and restart dev server |
| `User not found` after checkout | Ensure the user has been upserted into the `users` table before subscribing |
