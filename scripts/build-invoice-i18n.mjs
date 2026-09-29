/**
 * Build invoice PDF copy for all locales from EN+NL sources.
 *   node scripts/build-invoice-i18n.mjs
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { translateManyConcurrent, stripMtArtifacts, ALL_TARGET_LOCALES } from "./lib/translate.mjs";

const EN = {
  title: "Invoice",
  taxInvoice: "VAT invoice",
  paid: "PAID",
  from: "Supplier",
  billTo: "Bill to",
  invoiceNo: "Invoice number",
  orderNo: "Order number",
  issueDate: "Invoice date",
  paidDate: "Payment date",
  dueDate: "Due date",
  payment: "Payment method",
  category: "Category",
  currency: "Currency",
  description: "Description",
  qty: "Qty",
  unitExcl: "Unit excl.",
  unitPrice: "Unit price",
  lineVat: "VAT",
  lineIncl: "Total incl.",
  lineTotal: "Total",
  subtotal: "Subtotal excl. VAT",
  subtotalShort: "Subtotal",
  vat: "VAT",
  total: "Total incl. VAT",
  totalShort: "Total",
  status: "Status",
  reference: "Reference",
  project: "Project",
  emptyLines: "No line items",
  paymentTerms: "Payment terms",
  notes: "Notes",
  thanks:
    "Thank you for your order with TripleZero iT. This invoice confirms that payment was received successfully.",
  taxNote:
    "All amounts are in EUR. Listed sell prices include VAT (BTW) unless stated otherwise. VAT is broken down below.",
  footer:
    "This invoice was generated automatically after successful payment via Stripe. Please keep it for your records.",
  support: "Questions? Email",
  stripeRef: "Stripe reference",
  email: "Email",
  website: "Website",
  hosting: "Hosting",
  services: "Services / products",
  domainRegistration: "Domain registration",
  domainRenewal: "Domain renewal",
  domainTransfer: "Domain transfer",
  year: "year",
  years: "years",
  invoiceEmailSubject: "Invoice {number} — TripleZero iT",
  vatIncluded: "VAT included (broken down on the invoice)",
};

const NL = {
  title: "Factuur",
  taxInvoice: "BTW-factuur",
  paid: "BETAALD",
  from: "Leverancier",
  billTo: "Factuur aan",
  invoiceNo: "Factuurnummer",
  orderNo: "Bestelnummer",
  issueDate: "Factuurdatum",
  paidDate: "Betaaldatum",
  dueDate: "Vervaldatum",
  payment: "Betaalmethode",
  category: "Categorie",
  currency: "Valuta",
  description: "Omschrijving",
  qty: "Aantal",
  unitExcl: "Prijs excl.",
  unitPrice: "Prijs",
  lineVat: "BTW",
  lineIncl: "Totaal incl.",
  lineTotal: "Totaal",
  subtotal: "Subtotaal excl. BTW",
  subtotalShort: "Subtotaal",
  vat: "BTW",
  total: "Totaal incl. BTW",
  totalShort: "Totaal",
  status: "Status",
  reference: "Referentie",
  project: "Project",
  emptyLines: "Geen regels",
  paymentTerms: "Betalingsvoorwaarden",
  notes: "Notities",
  thanks:
    "Bedankt voor je bestelling bij TripleZero iT. Deze factuur bevestigt dat de betaling succesvol is ontvangen.",
  taxNote:
    "Alle bedragen zijn in EUR. Getoonde verkoopprijzen zijn inclusief BTW, tenzij anders vermeld. BTW is hieronder uitgesplitst.",
  footer:
    "Deze factuur is automatisch gegenereerd na succesvolle betaling via Stripe. Bewaar dit document voor je administratie.",
  support: "Vragen? Mail",
  stripeRef: "Stripe-referentie",
  email: "E-mail",
  website: "Website",
  hosting: "Hosting",
  services: "Diensten / producten",
  domainRegistration: "Domeinregistratie",
  domainRenewal: "Domeinverlenging",
  domainTransfer: "Domeintransfer",
  year: "jaar",
  years: "jaar",
  invoiceEmailSubject: "Factuur {number} — TripleZero iT",
  vatIncluded: "BTW 21% inbegrepen (uitgesplitst op de factuur)",
};

const OUT = "src/content/invoice-i18n.json";
const keys = Object.keys(EN);
const pack = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
pack.en = EN;
pack.nl = NL;

const CONCURRENCY = Number(process.env.MT_CONCURRENCY || 6);
const DELAY = Number(process.env.MT_DELAY_MS || 150);

for (const locale of ALL_TARGET_LOCALES.filter((l) => l !== "nl")) {
  const existing = pack[locale] || {};
  const needKeys = keys.filter((k) => !existing[k] || existing[k] === EN[k]);
  console.log(`=== ${locale}: translate ${needKeys.length}/${keys.length} ===`);
  if (!needKeys.length) {
    pack[locale] = existing;
    continue;
  }
  const srcs = needKeys.map((k) => EN[k]);
  const vals = await translateManyConcurrent(srcs, locale, "en", {
    concurrency: CONCURRENCY,
    delayMs: DELAY,
  });
  const next = { ...existing };
  needKeys.forEach((k, i) => {
    let v = stripMtArtifacts(vals[i] || "");
    if (!v || v === EN[k]) return;
    const srcPh = (EN[k].match(/\{[a-zA-Z0-9_]+\}/g) || []).join();
    const nextPh = (v.match(/\{[a-zA-Z0-9_]+\}/g) || []).join();
    if (srcPh && srcPh !== nextPh) return;
    next[k] = v;
  });
  // fill any still-missing from EN
  for (const k of keys) {
    if (!next[k]) next[k] = EN[k];
  }
  pack[locale] = next;
  writeFileSync(OUT, `${JSON.stringify(pack, null, 2)}\n`);
}

writeFileSync(OUT, `${JSON.stringify(pack, null, 2)}\n`);
console.log("wrote", OUT, "locales", Object.keys(pack).length);
