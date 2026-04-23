'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { SubscriptionPlan } from '@/types/database'

interface PricingButtonProps {
  plan: SubscriptionPlan
  label: string
  variant?: 'default' | 'outline'
  className?: string
}

export function PricingButton({
  plan,
  label,
  variant = 'default',
  className,
}: PricingButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick(): Promise<void> {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to create checkout session'
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch {
          // Fallback if response is not JSON
        }

        if (response.status === 401) {
          router.push('/login')
          return
        }
        console.error('[PricingButton] Checkout error:', errorMessage)
        return
      }

      const { url } = (await response.json()) as { url: string }
      // Redirect to Stripe Checkout
      router.push(url)
    } catch (err) {
      console.error('[PricingButton] Network error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={variant}
      className={className}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Redirecting…
        </span>
      ) : (
        label
      )}
    </Button>
  )
}
