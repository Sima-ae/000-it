export type AppointmentExtra = {
  id: string;
  title: string;
  titleNl: string;
  description: string;
  descriptionNl: string;
};

export const appointmentExtras: AppointmentExtra[] = [
  {
    id: "urgent",
    title: "Priority / urgent",
    titleNl: "Spoed / prioriteit",
    description: "Same-day or next-business-day preference when available.",
    descriptionNl: "Voorkeur voor vandaag of eerstvolgende werkdag indien beschikbaar.",
  },
  {
    id: "report",
    title: "Written report",
    titleNl: "Schriftelijk rapport",
    description: "Summary of findings and next steps after the session.",
    descriptionNl: "Samenvatting van bevindingen en vervolgstappen na het gesprek.",
  },
  {
    id: "multi-site",
    title: "Extra website / shop",
    titleNl: "Extra website / shop",
    description: "Include a second URL in the same appointment.",
    descriptionNl: "Neem een tweede URL mee in dezelfde afspraak.",
  },
  {
    id: "screen-share",
    title: "Screen-share deep dive",
    titleNl: "Schermdeling deep-dive",
    description: "Longer live walkthrough of your site or dashboard.",
    descriptionNl: "Uitgebreide live walkthrough van uw site of dashboard.",
  },
  {
    id: "follow-up",
    title: "Follow-up call (15 min)",
    titleNl: "Vervolggesprek (15 min)",
    description: "Short check-in within 7 days after the appointment.",
    descriptionNl: "Korte check-in binnen 7 dagen na de afspraak.",
  },
];

export const appointmentTimeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
] as const;

export type PaymentPreference = "invoice" | "link" | "none";

export const paymentPreferences: {
  id: PaymentPreference;
  title: string;
  titleNl: string;
  description: string;
  descriptionNl: string;
}[] = [
  {
    id: "none",
    title: "No payment now",
    titleNl: "Nu niet betalen",
    description: "Strategy intake — we confirm by email first.",
    descriptionNl: "Strategie-intake — we bevestigen eerst per e-mail.",
  },
  {
    id: "invoice",
    title: "Invoice afterwards",
    titleNl: "Factuur achteraf",
    description: "We send an invoice after the appointment or quote.",
    descriptionNl: "We sturen een factuur na de afspraak of offerte.",
  },
  {
    id: "link",
    title: "Payment link later",
    titleNl: "Betaallink later",
    description: "We’ll email a secure payment link when ready.",
    descriptionNl: "We mailen een veilige betaallink wanneer het zover is.",
  },
];

/** Next N bookable weekdays (Mon–Fri), starting tomorrow. */
export function getBookableDates(count = 14): Date[] {
  const dates: Date[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);

  while (dates.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function formatAppointmentDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
