import invoicePack from "@/content/invoice-i18n.json";

export type InvoiceCopy = {
  title: string;
  taxInvoice: string;
  paid: string;
  from: string;
  billTo: string;
  invoiceNo: string;
  orderNo: string;
  issueDate: string;
  paidDate: string;
  dueDate: string;
  payment: string;
  category: string;
  currency: string;
  description: string;
  qty: string;
  unitExcl: string;
  unitPrice: string;
  lineVat: string;
  lineIncl: string;
  lineTotal: string;
  subtotal: string;
  subtotalShort: string;
  vat: string;
  total: string;
  totalShort: string;
  status: string;
  reference: string;
  project: string;
  emptyLines: string;
  paymentTerms: string;
  notes: string;
  thanks: string;
  taxNote: string;
  footer: string;
  support: string;
  stripeRef: string;
  email: string;
  website: string;
  hosting: string;
  services: string;
  domainRegistration: string;
  domainRenewal: string;
  domainTransfer: string;
  year: string;
  years: string;
  invoiceEmailSubject: string;
  vatIncluded: string;
};

const pack = invoicePack as Record<string, InvoiceCopy>;

/** Invoice / order PDF + email copy for any site locale (falls back to EN). */
export function getInvoiceCopy(locale: string): InvoiceCopy {
  const code = (locale || "en").split("-")[0]?.toLowerCase() || "en";
  return pack[code] || pack.en || pack.nl;
}

export function invoiceBcp47(locale: string) {
  const code = (locale || "en").split("-")[0]?.toLowerCase() || "en";
  const map: Record<string, string> = {
    nl: "nl-NL",
    en: "en-GB",
    de: "de-DE",
    fr: "fr-FR",
    es: "es-ES",
    pt: "pt-PT",
    it: "it-IT",
    pl: "pl-PL",
    cs: "cs-CZ",
    sk: "sk-SK",
    hu: "hu-HU",
    ro: "ro-RO",
    bg: "bg-BG",
    hr: "hr-HR",
    sr: "sr-RS",
    bs: "bs-BA",
    cnr: "sr-ME",
    sq: "sq-AL",
    mk: "mk-MK",
    lt: "lt-LT",
    da: "da-DK",
    sv: "sv-SE",
    no: "nb-NO",
    fi: "fi-FI",
    uk: "uk-UA",
    ru: "ru-RU",
    tr: "tr-TR",
    he: "he-IL",
    ar: "ar-AE",
    el: "el-GR",
    ka: "ka-GE",
    hy: "hy-AM",
    az: "az-AZ",
    zh: "zh-CN",
    ja: "ja-JP",
  };
  return map[code] || "en-GB";
}
