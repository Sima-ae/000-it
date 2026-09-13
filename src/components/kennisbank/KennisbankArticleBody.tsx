import { KennisbankIllustration } from "@/components/kennisbank/KennisbankIllustration";

/** Enhance Tip/Note callouts when still plain paragraphs (any common label language). */
function enhanceBodyHtml(html: string): string {
  if (html.includes("kb-callout")) return html;
  return html
    .replace(
      /<p>\s*<strong>\s*(?:Tip|Tipp|Astuce|Consejo|Dica|Suggerimento|Wskazówka|Совет|提示|ヒント|İpucu|Tips|Vinkki|Порада|نصيحة|טיפ|Συμβουλή|Sfat):\s*<\/strong>([\s\S]*?)<\/p>/gi,
      '<aside class="kb-callout kb-callout-tip"><p><strong>Tip:</strong>$1</p></aside>',
    )
    .replace(
      /<p>\s*<strong>\s*(?:Let op|Note|Hinweis|Attention|Atenção|Attenzione|Uwaga|Важно|注意|Dikkat|Obs|Merk|Huomio|Увага|تنبيه|שימו לב|Προσοχή|Pozor|Figyelem):\s*<\/strong>([\s\S]*?)<\/p>/gi,
      '<aside class="kb-callout kb-callout-warn"><p><strong>Note:</strong>$1</p></aside>',
    );
}

function splitForMidImage(html: string): [string, string] {
  const marker = "</h2>";
  const first = html.indexOf(marker);
  if (first === -1) return [html, ""];
  const second = html.indexOf(marker, first + marker.length);
  if (second === -1) {
    const cut = first + marker.length;
    return [html.slice(0, cut), html.slice(cut)];
  }
  const cut = second + marker.length;
  return [html.slice(0, cut), html.slice(cut)];
}

export function KennisbankArticleBody({
  html,
  categorySlug,
  categoryLabel,
  footerLabel,
  heroCaption,
  midCaption,
}: {
  html: string;
  categorySlug: string;
  categoryLabel?: string;
  footerLabel?: string;
  heroCaption: string;
  midCaption: string;
}) {
  const enhanced = enhanceBodyHtml(html);
  const [before, after] = splitForMidImage(enhanced);

  return (
    <div className="kb-article-body">
      <KennisbankIllustration
        categorySlug={categorySlug}
        categoryLabel={categoryLabel}
        footerLabel={footerLabel}
        variant="hero"
        caption={heroCaption}
      />
      <div dangerouslySetInnerHTML={{ __html: before }} />
      {after ? (
        <>
          <KennisbankIllustration
            categorySlug={categorySlug}
            categoryLabel={categoryLabel}
            footerLabel={footerLabel}
            variant="mid"
            caption={midCaption}
          />
          <div dangerouslySetInnerHTML={{ __html: after }} />
        </>
      ) : null}
    </div>
  );
}
