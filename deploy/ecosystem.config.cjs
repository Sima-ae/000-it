/**
 * PM2 process file — TripleZero + ExtraHosting on the same build.
 *
 *   pm2 start deploy/ecosystem.config.cjs
 *   pm2 save
 *
 * ExtraHosting uses SITE_BRAND + Host detection; keep AUTH_URL / NEXT_PUBLIC
 * on the EH process pointed at extrahosting.eu (Auth callbacks).
 */
module.exports = {
  apps: [
    {
      name: "000-it",
      cwd: "/var/www/000-it.com",
      script: "node_modules/next/dist/bin/next",
      // Explicit -p: shared .env has PORT=3066 and must not win for either app.
      args: "start -p 3066",
      env: {
        NODE_ENV: "production",
        PORT: "3066",
        SITE_BRAND: "triplezero",
        NEXT_PUBLIC_APP_URL: "https://000-it.com",
        AUTH_URL: "https://000-it.com",
      },
    },
    {
      name: "extrahosting",
      cwd: "/var/www/000-it.com",
      script: "node_modules/next/dist/bin/next",
      // Must force 3067 — without -p, Next loads .env PORT=3066 → EADDRINUSE → 503.
      args: "start -p 3067",
      env: {
        NODE_ENV: "production",
        PORT: "3067",
        SITE_BRAND: "extrahosting",
        NEXT_PUBLIC_APP_URL: "https://extrahosting.eu",
        AUTH_URL: "https://extrahosting.eu",
        COMPANY_TRADE_NAME: "ExtraHosting",
        COMPANY_WEBSITE: "https://extrahosting.eu",
        COMPANY_EMAIL: "info@extrahosting.eu",
        COMPANY_SUPPORT_EMAIL: "support@extrahosting.eu",
        COMPANY_TAGLINE: "Domains · Websites · Webhosting",
      },
    },
  ],
};
