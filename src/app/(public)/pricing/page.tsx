import type { Metadata } from 'next'
import { PricingButton } from '@/components/shared/PricingButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Pricing — GolfDraw',
  description:
    'Choose your GolfDraw subscription plan. Enter monthly prize draws, track your Stableford scores, and support your favourite golf charity from £19.99/month.',
}

const FEATURES = [
  'Enter up to 5 Stableford scores',
  'Monthly prize draw entry',
  'Support your chosen charity',
  'Winner leaderboard access',
  'Monthly draw notifications',
] as const

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Simple, honest pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          One subscription. Full access to draws, scores, and charity giving.
        </p>
      </div>

      {/* ── Cards ── */}
      <div className="grid gap-8 sm:grid-cols-2">
        {/* Monthly */}
        <Card
          id="pricing-card-monthly"
          className="relative flex flex-col border border-border/60 bg-card shadow-md transition-shadow hover:shadow-xl"
        >
          <CardHeader className="space-y-2 pb-4">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Monthly
            </p>
            <CardTitle className="flex items-end gap-1">
              <span className="text-5xl font-extrabold text-foreground">£19.99</span>
              <span className="mb-1 text-base text-muted-foreground">/month</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Billed monthly. Cancel anytime.
            </p>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-6">
            <FeatureList />
            <PricingButton
              plan="monthly"
              label="Get Started — Monthly"
              variant="default"
              className="mt-auto w-full"
            />
          </CardContent>
        </Card>

        {/* Yearly — highlighted */}
        <Card
          id="pricing-card-yearly"
          className="relative flex flex-col border-2 border-primary bg-card shadow-md transition-shadow hover:shadow-xl"
        >
          {/* Best Value badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
              Best Value
            </Badge>
          </div>

          <CardHeader className="space-y-2 pb-4 pt-6">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Yearly
            </p>
            <CardTitle className="flex items-end gap-1">
              <span className="text-5xl font-extrabold text-foreground">£199.99</span>
              <span className="mb-1 text-base text-muted-foreground">/year</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Billed annually.</p>
              <Badge variant="outline" className="border-primary/40 text-primary text-xs font-medium">
                Save £39.89
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-6">
            <FeatureList />
            <PricingButton
              plan="yearly"
              label="Get Started — Yearly"
              variant="default"
              className="mt-auto w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Footer note ── */}
      <p className="mt-10 text-center text-sm text-muted-foreground">
        All plans include a minimum 10% charity contribution per subscription.
        Secure checkout powered by{' '}
        <span className="font-medium text-foreground">Stripe</span>.
      </p>
    </main>
  )
}

// ── Shared feature list ───────────────────────────────────────────────────────
function FeatureList() {
  return (
    <ul className="space-y-3 text-sm text-muted-foreground">
      {FEATURES.map((feature) => (
        <li key={feature} className="flex items-center gap-2.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 shrink-0 text-primary"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
  )
}
