import { redirect } from "next/navigation";

/** Legacy route — CRM leads pipeline is canonical */
export default async function LeadsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/crm/leads`);
}
