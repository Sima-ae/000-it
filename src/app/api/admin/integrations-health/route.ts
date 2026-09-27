import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { getStripe, isStripeConfigured } from "@/lib/shop/stripe";
import { isMailConfigured, sendMail } from "@/lib/mail";
import {
  isNamecheapConfigured,
  listDomains,
  namecheapMissingEnv,
} from "@/lib/domains/namecheap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authResult = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const sendTestMail = searchParams.get("sendMail") === "1";

  const report: Record<string, unknown> = {
    ok: true,
    checkedAt: new Date().toISOString(),
  };

  // Stripe
  if (!isStripeConfigured()) {
    report.stripe = { ok: false, error: "STRIPE_SECRET_KEY missing" };
    report.ok = false;
  } else {
    try {
      const stripe = getStripe();
      const key = (process.env.STRIPE_SECRET_KEY || "").trim();
      const mode = key.startsWith("sk_live_")
        ? "live"
        : key.startsWith("sk_test_")
          ? "test"
          : "unknown";
      await stripe.balance.retrieve();
      report.stripe = { ok: true, mode };
    } catch (error) {
      report.stripe = {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
      report.ok = false;
    }
  }

  // SMTP
  if (!isMailConfigured()) {
    report.smtp = { ok: false, error: "SMTP not configured" };
    report.ok = false;
  } else if (sendTestMail) {
    try {
      const to =
        process.env.ADMIN_ALERT_EMAIL?.trim() ||
        authResult.session.user.email ||
        process.env.SMTP_FROM?.trim() ||
        "";
      if (!to) throw new Error("No recipient for test mail");
      await sendMail({
        to,
        subject: "000-it integrations health check",
        text: `SMTP OK at ${new Date().toISOString()}`,
        html: `<p>SMTP OK at <strong>${new Date().toISOString()}</strong></p>`,
      });
      report.smtp = { ok: true, testMailSentTo: to };
    } catch (error) {
      report.smtp = {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
      report.ok = false;
    }
  } else {
    report.smtp = {
      ok: true,
      configured: true,
      hint: "Add ?sendMail=1 to send a test message",
    };
  }

  // Namecheap
  if (!isNamecheapConfigured()) {
    report.namecheap = {
      ok: false,
      error: "Not configured",
      missing: namecheapMissingEnv(),
    };
    report.ok = false;
  } else {
    try {
      const listed = await listDomains(1, 1);
      report.namecheap = {
        ok: listed.ok,
        sampleCount: listed.domains.length,
        error: listed.error,
      };
      if (!listed.ok) report.ok = false;
    } catch (error) {
      report.namecheap = {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
      report.ok = false;
    }
  }

  return NextResponse.json(report, { status: report.ok ? 200 : 503 });
}
