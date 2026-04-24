/**
 * SubscriptionGate — Server Component
 *
 * Wraps any content that requires an active subscription.
 * If the user's subscription is not active, renders a paywall upgrade card
 * with both monthly and yearly checkout buttons.
 *
 * Usage:
 *   <SubscriptionGate userId={user.id}>
 *     <ProtectedContent />
 *   </SubscriptionGate>
 */
import { getUserSubscription, isSubscriptionActive } from '@/lib/stripe/subscription'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PricingButton } from '@/components/shared/PricingButton'

interface SubscriptionGateProps {
  children: React.ReactNode
  userId: string
}

export async function SubscriptionGate({
  children,
  userId,
}: SubscriptionGateProps) {
  const subscription = await getUserSubscription(userId)
  const active = isSubscriptionActive(subscription)

  if (active) {
    return <>{children}</>
  }

  // ── Paywall ───────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md border border-border/60 bg-card shadow-xl">
        <CardHeader className="space-y-2 pb-4 text-center">
          {/* Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75A4.5 4.5 0 0012 2.25a4.5 4.5 0 00-4.5 4.5v3.75m-3 0h15a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5h-15a1.5 1.5 0 01-1.5-1.5v-7.5a1.5 1.5 0 011.5-1.5z"
              />
            </svg>
          </div>

          <CardTitle className="text-2xl font-bold tracking-tight">
            Upgrade to Play
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            Subscribe to access scores, draws, and charity features.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Feature list */}
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              'Enter up to 5 Stableford scores',
              'Monthly prize draw entry',
              'Support your chosen charity',
              'Winner leaderboard access',
              'Monthly draw notifications',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
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

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <PricingButton
              plan="monthly"
              label="Monthly — £19.99/mo"
              variant="default"
              className="flex-1"
            />
            <PricingButton
              plan="yearly"
              label="Yearly — £199.99/yr"
              variant="outline"
              className="flex-1"
            />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Secure checkout via Stripe · Cancel anytime
          </p>
        </CardContent>
      </Card>
    </div>
  )
}