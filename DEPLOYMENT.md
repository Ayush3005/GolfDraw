# GolfDraw Deployment Guide

This guide covers the steps required to deploy GolfDraw to Vercel with a Supabase backend and Stripe payments.

## 1. Pre-deployment Checklist
- [ ] All environment variables in `.env.local` have real values.
- [ ] Stripe products and prices created (run `npm run stripe:setup`).
- [ ] Supabase migrations `001`, `002`, `003` are applied to the production database.
- [ ] Test login works: `test@golfdraw.com` / `Test1234!`
- [ ] Admin login works: `admin@golfdraw.com` / `Admin1234!`
- [ ] Score entry and eviction logic verified.
- [ ] Stripe webhook tested locally using Stripe CLI.

## 2. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor**.
3. Run the migrations found in `/supabase/migrations` in order: `001`, `002`, `003`.
4. Copy the `URL` and `Anon Key` from **Settings > API**.
5. Copy the `Service Role Key` from the same page (keep this secret).

## 3. Stripe Setup
1. Ensure your account is in **Live Mode** (or test mode for staging).
2. Create two products: "Monthly Subscription" and "Yearly Subscription".
3. Copy the **Price IDs** for both.
4. Obtain your `Publishable Key` and `Secret Key` from **Developers > API keys**.

## 4. Vercel Deployment
1. Connect your GitHub repository to [Vercel](https://vercel.com/).
2. In the **Environment Variables** section, add all keys listed in `.env.production.example`.
3. Click **Deploy**.

## 5. Configure Stripe Webhook
1. Once deployed, go to the Stripe Dashboard → **Developers > Webhooks**.
2. Click **Add endpoint**.
3. URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Select the following events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Webhook Secret** and add it to Vercel as `STRIPE_WEBHOOK_SECRET`.
6. Redeploy if necessary for the environment variable to take effect.

## 6. Post-deployment Verification
- [ ] Landing page loads correctly and animations trigger.
- [ ] Signup and login flows are functional.
- [ ] Stripe checkout completes successfully (use test cards if in test mode).
- [ ] Score entry is reflected in the dashboard.
- [ ] Admin panel is restricted to admin users.
- [ ] Charity selection updates correctly.

---
Built with ♥ by the GolfDraw Team.
