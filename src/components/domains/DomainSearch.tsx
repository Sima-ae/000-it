"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type TldProduct = {
  tld: string;
  priceInCents: number;
  priceLabel: string;
};

type CheckResult = {
  domain: string;
  available: boolean;
  priceInCents: number | null;
  tld: string;
};

const searchSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(63)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,30})?$/i),
});

const registrantSchema = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  email: z.string().email().max(190),
  phone: z.string().min(6).max(40),
  address1: z.string().min(2).max(120),
  city: z.string().min(1).max(80),
  stateProvince: z.string().max(80).optional(),
  postalCode: z.string().min(2).max(20),
  country: z.string().min(2).max(2),
  organization: z.string().max(120).optional(),
});

type RegistrantForm = z.infer<typeof registrantSchema>;

export function DomainSearch() {
  const t = useTranslations("domainsPage");
  const locale = useLocale();
  const [selectedTlds, setSelectedTlds] = useState<string[]>([]);
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [checkoutDomain, setCheckoutDomain] = useState<CheckResult | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["domain-products"],
    queryFn: async () => {
      const res = await fetch("/api/domains/products");
      if (!res.ok) throw new Error("products");
      return (await res.json()) as TldProduct[];
    },
  });

  const activeTlds = useMemo(() => {
    if (selectedTlds.length) return selectedTlds;
    return products.slice(0, 6).map((p) => p.tld);
  }, [products, selectedTlds]);

  const searchForm = useForm<{ query: string }>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: "" },
  });

  const registrantForm = useForm<RegistrantForm>({
    resolver: zodResolver(registrantSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address1: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "NL",
      organization: "",
    },
  });

  const checkMutation = useMutation({
    mutationFn: async (query: string) => {
      const q = query.toLowerCase().trim();
      const params = new URLSearchParams({ domain: q });
      if (!q.includes(".")) {
        params.set("tlds", activeTlds.join(","));
      }
      const res = await fetch(`/api/domains/check?${params}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("checkFailed"));
      return data.results as CheckResult[];
    },
    onSuccess: (rows) => setResults(rows),
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : t("checkFailed")),
  });

  const checkoutMutation = useMutation({
    mutationFn: async (input: {
      domain: string;
      registrant: RegistrantForm;
    }) => {
      const res = await fetch("/api/domains/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainName: input.domain,
          years: 1,
          locale,
          registrant: {
            ...input.registrant,
            stateProvince: input.registrant.stateProvince || "NA",
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("checkoutFailed"));
      return data as { url: string };
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : t("checkoutFailed")),
  });

  function toggleTld(tld: string) {
    setSelectedTlds((prev) => {
      const base = prev.length ? prev : products.slice(0, 6).map((p) => p.tld);
      return base.includes(tld)
        ? base.filter((x) => x !== tld)
        : [...base, tld];
    });
  }

  return (
    <div className="w-full">
      <form
        onSubmit={searchForm.handleSubmit((values) =>
          checkMutation.mutate(values.query),
        )}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="flex-1">
          <Input
            {...searchForm.register("query")}
            placeholder={t("placeholder")}
            className="h-12 rounded-2xl"
            autoComplete="off"
          />
          {searchForm.formState.errors.query ? (
            <p className="mt-1 text-sm text-destructive">{t("invalidFormat")}</p>
          ) : null}
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 rounded-2xl"
          disabled={checkMutation.isPending}
        >
          {checkMutation.isPending ? t("searching") : t("search")}
        </Button>
      </form>

      {products.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {products.map((p) => {
            const on = activeTlds.includes(p.tld);
            return (
              <button
                key={p.tld}
                type="button"
                onClick={() => toggleTld(p.tld)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition",
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                .{p.tld} · {p.priceLabel}
              </button>
            );
          })}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {results ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 space-y-2"
          >
            {results.map((row) => (
              <div
                key={row.domain}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{row.domain}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.available ? t("available") : t("unavailable")}
                    {row.available && row.priceInCents != null
                      ? ` · ${(row.priceInCents / 100).toFixed(2)} €`
                      : null}
                  </p>
                </div>
                {row.available ? (
                  <Button
                    className="rounded-xl"
                    onClick={() => setCheckoutDomain(row)}
                  >
                    {t("order")}
                  </Button>
                ) : null}
              </div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Dialog
        open={Boolean(checkoutDomain)}
        onOpenChange={(open) => {
          if (!open) setCheckoutDomain(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("registrantTitle")}</DialogTitle>
            <DialogDescription>
              {checkoutDomain
                ? t("registrantSubtitle", { domain: checkoutDomain.domain })
                : null}
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={registrantForm.handleSubmit((values) => {
              if (!checkoutDomain) return;
              checkoutMutation.mutate({
                domain: checkoutDomain.domain,
                registrant: values,
              });
            })}
          >
            {(
              [
                ["firstName", t("firstName")],
                ["lastName", t("lastName")],
                ["email", t("email")],
                ["phone", t("phone")],
                ["address1", t("address")],
                ["city", t("city")],
                ["postalCode", t("postalCode")],
                ["country", t("country")],
                ["organization", t("organization")],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className={cn(
                  key === "address1" || key === "organization"
                    ? "sm:col-span-2"
                    : "",
                )}
              >
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  className="mt-1"
                  {...registrantForm.register(key)}
                />
              </div>
            ))}
            <DialogFooter className="sm:col-span-2">
              <Button
                type="submit"
                disabled={checkoutMutation.isPending}
                className="rounded-xl"
              >
                {checkoutMutation.isPending ? t("processing") : t("pay")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
