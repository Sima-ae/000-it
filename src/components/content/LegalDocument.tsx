import { getTranslations } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import type { ContentBlock } from "@/lib/fixweb-content";
import type { LegalPageContent } from "@/lib/legal-content";

function expandContactBlocks(blocks: ContentBlock[]): ContentBlock[] {
  const out: ContentBlock[] = [];

  for (const block of blocks) {
    if (block.type !== "paragraph") {
      out.push(block);
      continue;
    }

    const lines = block.text
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const parts = (lines.length > 1 ? lines : [block.text]).flatMap((line) => {
      const m = line.match(/^(.*?)((?:Website|E-mail|Email):\s*\S+)\s*((?:E-mail|Email):\s*\S+)\s*$/i);
      if (m) return [m[1].trim(), m[2], m[3]].filter(Boolean);
      return [line];
    });

    if (parts.length <= 1) {
      out.push(block);
      continue;
    }

    for (const text of parts) {
      out.push({ type: "paragraph", text });
    }
  }

  return out;
}

function LegalBlocks({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks.length) return null;
  return <ContentBlocks blocks={expandContactBlocks(blocks)} compact />;
}

export async function LegalDocument({
  locale,
  page,
}: {
  locale: string;
  page: LegalPageContent;
}) {
  const t = await getTranslations({ locale, namespace: "legal" });
  const mail =
    page.slug === "privacy-policy" || page.slug === "cookie-policy"
      ? "privacy@000-it.com"
      : "info@000-it.com";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          TripleZero iT
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-4xl">
          {page.title}
        </h1>
        <p className="text-xs text-muted-foreground md:text-sm">{page.updatedLabel}</p>
      </header>

      <div className="mt-6 space-y-5">
        <article className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm md:p-6">
          <LegalBlocks blocks={page.beforeVendors} />

          {page.cookieVendors.length > 0 ? (
            <div className="mt-5 space-y-4">
              {page.cookieVendors.map((vendor) => (
                <section
                  key={vendor.name}
                  className="space-y-2 border-t border-border/50 pt-4"
                >
                  <div className="space-y-0.5">
                    <h2 className="font-display text-base font-semibold tracking-tight text-foreground md:text-lg">
                      {vendor.name}
                    </h2>
                    {vendor.category ? (
                      <p className="text-xs text-muted-foreground md:text-sm">
                        {vendor.category}
                      </p>
                    ) : null}
                  </div>
                  {vendor.usage ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {vendor.usage}
                    </p>
                  ) : null}
                  {vendor.sharing ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">{t("sharingData")} </span>
                      {vendor.sharing}
                    </p>
                  ) : null}
                  {vendor.cookies.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-border/60">
                      <table className="min-w-full text-left text-xs md:text-sm">
                        <thead className="bg-muted/40 text-foreground">
                          <tr>
                            <th className="px-2.5 py-1.5 font-medium">{t("name")}</th>
                            <th className="px-2.5 py-1.5 font-medium">{t("expiration")}</th>
                            <th className="px-2.5 py-1.5 font-medium">{t("function")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendor.cookies.map((cookie, idx) => (
                            <tr
                              key={`${vendor.name}-${cookie.name}-${idx}`}
                              className="border-t border-border/50"
                            >
                              <td className="px-2.5 py-1.5 align-top font-mono text-[11px] text-foreground md:text-xs">
                                {cookie.name}
                              </td>
                              <td className="px-2.5 py-1.5 align-top text-muted-foreground">
                                {cookie.expiration}
                              </td>
                              <td className="px-2.5 py-1.5 align-top text-muted-foreground">
                                {cookie.function}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          ) : null}

          {page.afterVendors.length > 0 ? (
            <div className="mt-5">
              <LegalBlocks blocks={page.afterVendors} />
            </div>
          ) : null}
        </article>

        <nav className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground md:text-sm">
          {page.related.map((item) => (
            <SoftLink
              key={item.href}
              href={item.href}
              className="underline-offset-4 transition hover:text-foreground hover:underline"
            >
              {item.label}
            </SoftLink>
          ))}
          <a
            href={`mailto:${mail}`}
            className="underline-offset-4 transition hover:text-foreground hover:underline"
          >
            {mail}
          </a>
        </nav>
      </div>
    </div>
  );
}
