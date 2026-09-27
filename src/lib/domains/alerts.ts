import { isMailConfigured, sendMail } from "@/lib/mail";

export async function sendFailedDomainOrderAlert(input: {
  orderId: string;
  orderNumber: string;
  domainName: string;
  userEmail: string;
  errorDetails: string;
}) {
  if (!isMailConfigured()) {
    console.warn("[domains] SMTP not configured; skip fail alert");
    return;
  }
  const to =
    process.env.ADMIN_ALERT_EMAIL?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    "info@000-it.com";

  const subject = `Domain registration failed: ${input.domainName}`;
  const text = [
    "Customer paid via Stripe but Namecheap registration failed.",
    `Order: ${input.orderNumber} (${input.orderId})`,
    `Domain: ${input.domainName}`,
    `Customer: ${input.userEmail}`,
    "",
    "Error / response:",
    input.errorDetails,
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;padding:20px;border:1px solid #e1e1e1;border-radius:8px">
      <h2 style="color:#dc2626;margin-top:0">Domain fulfillment failed</h2>
      <p>The customer paid via Stripe, but automatic Namecheap registration failed.</p>
      <table style="width:100%;text-align:left;font-size:14px">
        <tr><th>Order</th><td>${input.orderNumber}</td></tr>
        <tr><th>Domain</th><td><strong>${input.domainName}</strong></td></tr>
        <tr><th>Customer</th><td>${input.userEmail}</td></tr>
      </table>
      <h3>Details</h3>
      <pre style="background:#f4f4f5;padding:12px;border-radius:4px;font-size:12px;white-space:pre-wrap">${input.errorDetails
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</pre>
    </div>
  `;

  try {
    await sendMail({ to, subject, text, html });
  } catch (error) {
    console.error("[domains] fail alert email", error);
  }
}
