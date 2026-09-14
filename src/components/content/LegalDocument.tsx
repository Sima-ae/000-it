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
  return <ContentBlocks blocks={expandContactBlocks(blocks)} />;
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
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-20">
      <header className="space-y-3">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">TripleZero iT</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {page.title}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">{page.updatedLabel}</p>
      </header>

      <div className="mt-10 space-y-10">
        <article className="rounded-[1.75rem] border border-border/60 bg-background/70 p-6 shadow-sm md:p-10">
          <LegalBlocks blocks={page.beforeVendors} />

          {page.cookieVendors.length > 0 ? (
            <div className="mt-10 space-y-8">
              {page.cookieVendors.map((vendor) => (
                <section
                  key={vendor.name}
                  className="space-y-4 border-t border-border/50 pt-8"
                >
                  <div className="space-y-1">
                    <h2 className="font-display text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                      {vendor.name}
                    </h2>
                    {vendor.category ? (
                      <p className="text-sm text-muted-foreground">{vendor.category}</p>
                    ) : null}
                  </div>
                  {vendor.usage ? (
                    <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                      {vendor.usage}
                    </p>
                  ) : null}
                  {vendor.sharing ? (
                    <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                      <span className="font-medium text-foreground">{t("sharingData")}</span>
                      {vendor.sharing}
                    </p>
                  ) : null}
                  {vendor.cookies.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-border/60">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-muted/40 text-foreground">
                          <tr>
                            <th className="px-3 py-2 font-medium">{t("name")}</th>
                            <th className="px-3 py-2 font-medium">{t("expiration")}</th>
                            <th className="px-3 py-2 font-medium">{t("function")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendor.cookies.map((cookie, idx) => (
                            <tr
                              key={`${vendor.name}-${cookie.name}-${idx}`}
                              className="border-t border-border/50"
                            >
                              <td className="px-3 py-2 align-top font-mono text-xs text-foreground md:text-sm">
                                {cookie.name}
                              </td>
                              <td className="px-3 py-2 align-top text-muted-foreground">
                                {cookie.expiration}
                              </td>
                              <td className="px-3 py-2 align-top text-muted-foreground">
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
            <div className="mt-10">
              <LegalBlocks blocks={page.afterVendors} />
            </div>
          ) : null}
        </article>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
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
