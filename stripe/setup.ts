/**
 * Stripe Product + Price Setup Script
 *
 * Run ONCE to create GolfDraw products and prices in your Stripe account.
 * Usage: npx ts-node --project tsconfig.json stripe/setup.ts
 *
 * After running, paste the logged price IDs into .env.local:
 *   STRIPE_MONTHLY_PRICE_ID=price_xxx
 *   STRIPE_YEARLY_PRICE_ID=price_xxx
 *
 * Requires STRIPE_SECRET_KEY to be set in your environment.
 */
import Stripe from 'stripe'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local from project root
dotenv.config({ path: path.join(process.cwd(), '.env.local') })


if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not set in .env.local')
  process.exit(1)
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia' as any,
})


async function setup(): Promise<void> {
  console.log('🚀 Setting up GolfDraw Stripe products and prices...\n')

  // ── Create product ──────────────────────────────────────────────────────────
  const product = await stripe.products.create({
    name: 'GolfDraw Subscription',
    description:
      'Monthly prize draw entry, Stableford score tracking, and charity contribution for golfers.',
    metadata: {
      platform: 'golfdraw',
    },
  })

  console.log(`✅ Product created: ${product.name} (${product.id})\n`)

  // ── Monthly price: £19.99 = 1999 pence ─────────────────────────────────────
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 1999, // pence
    currency: 'gbp',
    recurring: {
      interval: 'month',
    },
    nickname: 'GolfDraw Monthly',
    metadata: {
      plan: 'monthly',
    },
  })

  // ── Yearly price: £199.99 = 19999 pence ────────────────────────────────────
  const yearlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 19999, // pence
    currency: 'gbp',
    recurring: {
      interval: 'year',
    },
    nickname: 'GolfDraw Yearly',
    metadata: {
      plan: 'yearly',
    },
  })

  // ── Output ──────────────────────────────────────────────────────────────────
  console.log('✅ Prices created. Add these to your .env.local:\n')
  console.log(`STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`)
  console.log(`STRIPE_YEARLY_PRICE_ID=${yearlyPrice.id}`)
  console.log('\n✨ Setup complete!')
}

setup().catch((err: unknown) => {
  console.error('❌ Setup failed:', err)
  process.exit(1)
})
