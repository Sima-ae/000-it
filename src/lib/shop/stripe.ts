import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;
let stripeKeyUsed: string | null = null;

function readSecretKey() {
  const key = (process.env.STRIPE_SECRET_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!key.startsWith("sk_live_") && !key.startsWith("sk_test_")) {
    throw new Error(
      "STRIPE_SECRET_KEY looks invalid (must start with sk_live_ or sk_test_). Restart the app after updating .env.",
    );
  }
  return key;
}

export function getStripe() {
  const key = readSecretKey();
  if (!stripeSingleton || stripeKeyUsed !== key) {
    stripeSingleton = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
    stripeKeyUsed = key;
  }
  return stripeSingleton;
}

export function isStripeConfigured() {
  const key = (process.env.STRIPE_SECRET_KEY || "").trim().replace(/^["']|["']$/g, "");
  return key.startsWith("sk_live_") || key.startsWith("sk_test_");
}
