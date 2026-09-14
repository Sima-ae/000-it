import { redirect } from "next/navigation";
import { localizedHref } from "@/i18n/pathnames";

/** Legacy route — CRM clients is canonical */
export default async function ClientsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(localizedHref(locale, "/crm/clients"));
}
