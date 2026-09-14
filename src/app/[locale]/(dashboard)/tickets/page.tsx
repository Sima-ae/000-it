import { redirect } from "next/navigation";
import { localizedHref } from "@/i18n/pathnames";

/** Legacy route — CRM is the canonical tickets inbox */
export default async function TicketsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(localizedHref(locale, "/crm/tickets"));
}
