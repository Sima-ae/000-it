import { redirect } from "next/navigation";
import { localizedHref } from "@/i18n/pathnames";

/** Legacy route — CRM leads pipeline is canonical */
export default async function LeadsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(localizedHref(locale, "/crm/leads"));
}
