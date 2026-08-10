import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/marketing/Reveal";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { getImportedPage } from "@/lib/fixweb-content";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = getImportedPage("privacy-policy");

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {locale === "nl" ? "Privacybeleid" : page?.title || "Privacy Policy"}
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <div className="glass mt-10 rounded-[1.75rem] p-6 md:p-10">
          <ContentBlocks blocks={page?.blocks || []} />
        </div>
      </Reveal>
    </div>
  );
}
