import { loadStripe, Stripe as StripeClient } from "@stripe/stripe-js";
import Stripe from "stripe";

let stripePromise: Promise<StripeClient | null>;

export function getStripeClient(): Promise<StripeClient | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
}

export function getStripeServer(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}
