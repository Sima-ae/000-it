import { redirect } from "next/navigation";

/** Legacy route — CRM is the canonical tickets inbox */
export default async function TicketsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/crm/tickets`);
}
