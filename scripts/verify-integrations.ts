/**
 * Verify Stripe / SMTP / Namecheap without changing credentials.
 *   npx tsx --env-file=.env scripts/verify-integrations.ts
 *   SEND_TEST_MAIL=1 npx tsx --env-file=.env scripts/verify-integrations.ts
 */
import { getStripe, isStripeConfigured } from "../src/lib/shop/stripe";
import { isMailConfigured, sendMail } from "../src/lib/mail";
import {
  isNamecheapConfigured,
  listDomains,
  namecheapMissingEnv,
} from "../src/lib/domains/namecheap";

async function main() {
  const out: Record<string, unknown> = {};

  if (!isStripeConfigured()) {
    out.stripe = { ok: false, error: "missing key" };
  } else {
    try {
      const key = (process.env.STRIPE_SECRET_KEY || "").trim();
      const mode = key.startsWith("sk_live_")
        ? "live"
        : key.startsWith("sk_test_")
          ? "test"
          : "unknown";
      await getStripe().balance.retrieve();
      out.stripe = { ok: true, mode };
    } catch (e) {
      out.stripe = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  if (!isMailConfigured()) {
    out.smtp = { ok: false, error: "not configured" };
  } else if (process.env.SEND_TEST_MAIL === "1") {
    try {
      const to =
        process.env.ADMIN_ALERT_EMAIL?.trim() ||
        process.env.SMTP_FROM?.trim() ||
        "";
      await sendMail({
        to,
        subject: "000-it verify-integrations",
        text: `OK ${new Date().toISOString()}`,
      });
      out.smtp = { ok: true, sentTo: to };
    } catch (e) {
      out.smtp = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  } else {
    out.smtp = { ok: true, configured: true, hint: "SEND_TEST_MAIL=1 to send" };
  }

  if (!isNamecheapConfigured()) {
    out.namecheap = { ok: false, missing: namecheapMissingEnv() };
  } else {
    try {
      const listed = await listDomains(1, 1);
      out.namecheap = {
        ok: listed.ok,
        count: listed.domains.length,
        error: listed.error,
      };
    } catch (e) {
      out.namecheap = {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  console.log(JSON.stringify(out, null, 2));
  const failed = Object.values(out).some(
    (v) => v && typeof v === "object" && (v as { ok?: boolean }).ok === false,
  );
  process.exit(failed ? 1 : 0);
}

main();
