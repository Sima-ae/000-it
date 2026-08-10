import { redirect } from "next/navigation";

/** Legacy route — CRM clients is canonical */
export default async function ClientsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/crm/clients`);
}
