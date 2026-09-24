import nodemailer from "nodemailer";

export type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

function mailConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from =
    process.env.SMTP_FROM?.trim() ||
    process.env.MAIL_FROM?.trim() ||
    user ||
    "noreply@000-it.com";

  if (!host || !user || !pass) {
    return null;
  }

  return {
    from,
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
  };
}

export function isMailConfigured() {
  return Boolean(mailConfig());
}

/** Send an email when SMTP is configured. Throws if send fails. */
export async function sendMail(input: SendMailInput) {
  const config = mailConfig();
  if (!config) {
    const err = new Error("SMTP_NOT_CONFIGURED");
    throw err;
  }

  await config.transporter.sendMail({
    from: config.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html || input.text.replace(/\n/g, "<br/>"),
    replyTo: input.replyTo,
  });
}
