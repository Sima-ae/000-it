/** Client-safe Stripe publishable key presence check. */
export function isStripeConfiguredClient() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  return key.startsWith("pk_");
}
