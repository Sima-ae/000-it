"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/marketing/GlassCard";
import {
  serviceCatalog,
  sortedServiceGroups,
  type ServiceNavItem,
} from "@/content/fixweb/catalog";
import {
  catalogGroupTitle,
  catalogServiceSummary,
  catalogServiceTitle,
} from "@/content/fixweb/catalog-title";
import {
  appointmentExtraCopy,
  appointmentPrefCopy,
} from "@/content/appointment-i18n";
import {
  appointmentExtras,
  appointmentTimeSlots,
  formatAppointmentDate,
  getBookableDates,
  paymentPreferences,
  toDateKey,
  type PaymentPreference,
} from "@/content/appointment";
import { cn } from "@/lib/utils";

const STEP_IDS = [
  "service",
  "extras",
  "time",
  "details",
  "payment",
  "done",
] as const;

const STEP_LABEL_KEYS = [
  "stepService",
  "stepExtras",
  "stepTime",
  "stepDetails",
  "stepPayment",
  "stepDone",
] as const;

function sortServices(items: ServiceNavItem[], locale: string) {
  return [...items].sort((a, b) =>
    catalogServiceTitle(a.slug, locale, a.title).localeCompare(
      catalogServiceTitle(b.slug, locale, b.title),
      locale,
      { sensitivity: "base" },
    ),
  );
}

/** Shorter category chips on /afspraak only */
function appointmentGroupLabel(
  group: { id: string; title: string; titleNl: string },
  locale: string,
) {
  if (group.id === "webdesign") return "Webdesign";
  if (group.id === "wordpress") return "WordPress";
  return catalogGroupTitle(group.id, locale, group.title);
}

export function AppointmentBooking() {
  const locale = useLocale();
  const t = useTranslations("appointment");

  const [stepIndex, setStepIndex] = useState(0);
  const [serviceSlug, setServiceSlug] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("ai");
  const [extras, setExtras] = useState<string[]>([]);
  const [dateKey, setDateKey] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<PaymentPreference>("none");
  const [submitting, setSubmitting] = useState(false);

  const bookableDates = useMemo(() => getBookableDates(14), []);
  const groups = useMemo(() => sortedServiceGroups(locale), [locale]);

  const services = useMemo(() => {
    const list = serviceCatalog.filter((s) => s.group === groupFilter);
    return sortServices(list, locale);
  }, [groupFilter, locale]);

  const selectedService = serviceCatalog.find((s) => s.slug === serviceSlug);
  const selectedExtras = appointmentExtras.filter((e) => extras.includes(e.id));
  const selectedDate = bookableDates.find((d) => toDateKey(d) === dateKey);
  const selectedPayment = paymentPreferences.find((p) => p.id === payment);

  const stepId = STEP_IDS[stepIndex];

  function toggleExtra(id: string) {
    setExtras((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function canContinue(): boolean {
    switch (stepId) {
      case "service":
        return Boolean(serviceSlug);
      case "extras":
        return true;
      case "time":
        return Boolean(dateKey && timeSlot);
      case "details":
        return name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      case "payment":
        return Boolean(payment);
      case "done":
        return false;
      default:
        return false;
    }
  }

  function goNext() {
    if (stepId === "payment") {
      void submitBooking();
      return;
    }
    if (!canContinue()) return;
    setStepIndex((i) => Math.min(i + 1, STEP_IDS.length - 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function submitBooking() {
    if (!selectedService || !selectedDate || !canContinue()) return;
    setSubmitting(true);

    const serviceTitle = catalogServiceTitle(
      selectedService.slug,
      locale,
      selectedService.title,
    );
    const extrasText = selectedExtras.length
      ? selectedExtras.map((e) => appointmentExtraCopy(e.id, locale).title).join(", ")
      : t("none");
    const paymentText = selectedPayment
      ? appointmentPrefCopy(selectedPayment.id, locale).title
      : payment;
    const when = `${toDateKey(selectedDate)} ${timeSlot}`;

    const message = [
      `${t("title")} (/afspraak)`,
      "",
      `${t("service")}: ${serviceTitle} (${selectedService.slug})`,
      `${t("extras")}: ${extrasText}`,
      `${t("when")}: ${when}`,
      `${t("phoneOptional")}: ${phone.trim() || "—"}`,
      `${t("stepPayment")}: ${paymentText}`,
      "",
      `${t("notesOptional")}:`,
      notes.trim() || "—",
    ].join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          message,
          source: "APPOINTMENT",
        }),
      });
      if (!res.ok) throw new Error("fail");
      setStepIndex(STEP_IDS.length - 1);
      toast.success(t("toastSuccess"));
    } catch {
      toast.error(t("toastError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassCard interactive={false} className="mx-auto w-full max-w-3xl p-5 md:p-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand md:text-4xl">
        {t("title")}
      </h1>

      <ol className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {STEP_IDS.map((id, i) => {
          const active = i === stepIndex;
          const done = i < stepIndex;
          return (
            <li key={id} className="min-w-0">
              <p
                className={cn(
                  "truncate text-[11px] font-medium md:text-xs",
                  active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {i + 1}. {t(STEP_LABEL_KEYS[i])}
              </p>
              <div
                className={cn(
                  "mt-1.5 h-1.5 rounded-full",
                  active || done ? "bg-primary" : "bg-muted",
                )}
              />
            </li>
          );
        })}
      </ol>

      <div className="mt-8 min-h-88">
        {stepId === "service" && (
          <div className="space-y-5">
            <p className="text-sm font-medium text-brand-mint">{t("selectService")}</p>
            <div className="flex flex-wrap gap-2">
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setGroupFilter(g.id);
                    setServiceSlug("");
                  }}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-medium transition",
                    groupFilter === g.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/70 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {appointmentGroupLabel(g, locale)}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dienst" className="text-primary">
                {t("service")}
              </Label>
              <select
                id="dienst"
                value={serviceSlug}
                onChange={(e) => setServiceSlug(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option value="">{t("selectAService")}</option>
                {services.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {catalogServiceTitle(item.slug, locale, item.title)}
                  </option>
                ))}
              </select>
            </div>
            {selectedService ? (
              <p className="rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                {catalogServiceSummary(
                  selectedService.slug,
                  locale,
                  selectedService.summary || selectedService.summaryNl || "",
                ) || t("serviceFallback")}
              </p>
            ) : null}
          </div>
        )}

        {stepId === "extras" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("optionalExtras")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {appointmentExtras.map((extra) => {
                const on = extras.includes(extra.id);
                const copy = appointmentExtraCopy(extra.id, locale);
                return (
                  <button
                    key={extra.id}
                    type="button"
                    onClick={() => toggleExtra(extra.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition",
                      on
                        ? "border-primary bg-primary/10"
                        : "border-border/70 hover:border-primary/40 hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-foreground">{copy.title}</p>
                      {on ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{copy.description}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">{t("skipExtras")}</p>
          </div>
        )}

        {stepId === "time" && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">{t("pickDateTime")}</p>
            <div>
              <p className="mb-2 text-sm font-medium text-primary">{t("date")}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {bookableDates.map((d) => {
                  const key = toDateKey(d);
                  const on = dateKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDateKey(key)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm transition",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/70 hover:border-primary/40",
                      )}
                    >
                      {formatAppointmentDate(d, locale)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-primary">{t("time")}</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {appointmentTimeSlots.map((slot) => {
                  const on = timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={cn(
                        "rounded-xl border px-2 py-2 text-sm tabular-nums transition",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/70 hover:border-primary/40",
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {stepId === "details" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("enterDetails")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("phoneOptional")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="company">{t("companyOptional")}</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">{t("notesOptional")}</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("notesPlaceholder")}
                />
              </div>
            </div>
          </div>
        )}

        {stepId === "payment" && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">{t("choosePayment")}</p>
            <div className="space-y-3">
              {paymentPreferences.map((pref) => {
                const on = payment === pref.id;
                const copy = appointmentPrefCopy(pref.id, locale);
                return (
                  <button
                    key={pref.id}
                    type="button"
                    onClick={() => setPayment(pref.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition",
                      on
                        ? "border-primary bg-primary/10"
                        : "border-border/70 hover:border-primary/40",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      )}
                    >
                      {on ? <Check className="h-2.5 w-2.5" /> : null}
                    </span>
                    <span>
                      <span className="block font-medium">{copy.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {copy.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm">
              <p className="font-medium">{t("summary")}</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>
                  {t("service")}:{" "}
                  <span className="text-foreground">
                    {selectedService
                      ? catalogServiceTitle(
                          selectedService.slug,
                          locale,
                          selectedService.title,
                        )
                      : "—"}
                  </span>
                </li>
                <li>
                  {t("extras")}:{" "}
                  <span className="text-foreground">
                    {selectedExtras.length
                      ? selectedExtras
                          .map((e) => appointmentExtraCopy(e.id, locale).title)
                          .join(", ")
                      : t("none")}
                  </span>
                </li>
                <li>
                  {t("when")}:{" "}
                  <span className="text-foreground">
                    {selectedDate
                      ? `${formatAppointmentDate(selectedDate, locale)} · ${timeSlot}`
                      : "—"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {stepId === "done" && (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Check className="h-7 w-7" />
            </div>
            <h2 className="font-display mt-5 text-2xl font-semibold tracking-tight">
              {t("requestReceived")}
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">{t("thankYou")}</p>
            {selectedService && selectedDate ? (
              <p className="mt-4 text-sm text-foreground">
                {catalogServiceTitle(selectedService.slug, locale, selectedService.title) +
                  " · " +
                  formatAppointmentDate(selectedDate, locale) +
                  " · " +
                  timeSlot}
              </p>
            ) : null}
          </div>
        )}
      </div>

      {stepId !== "done" ? (
        <>
          <hr className="my-6 border-border/60" />
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              className="rounded-2xl"
              onClick={goBack}
              disabled={stepIndex === 0 || submitting}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t("back")}
            </Button>
            <Button
              type="button"
              className="rounded-2xl uppercase tracking-wide"
              onClick={goNext}
              disabled={!canContinue() || submitting}
            >
              {stepId === "payment"
                ? submitting
                  ? t("sending")
                  : t("confirm")
                : t("next")}
              {stepId !== "payment" ? <ChevronRight className="ml-1 h-4 w-4" /> : null}
            </Button>
          </div>
        </>
      ) : null}
    </GlassCard>
  );
}
