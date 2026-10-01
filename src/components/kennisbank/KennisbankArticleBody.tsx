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

/**
 * Renders curated kennisbank HTML.
 * Decorative category SVGs were removed — body is the guide itself.
 * Optional real screenshots can use <figure class="kb-figure">…</figure> in bodyHtml.
 */
export function KennisbankArticleBody({
  html,
}: {
  html: string;
  /** @deprecated unused — kept for call-site compatibility */
  categorySlug?: string;
  categoryLabel?: string;
  footerLabel?: string;
  heroCaption?: string;
  midCaption?: string;
}) {
  const enhanced = enhanceBodyHtml(html);

  return (
    <div
      className="kb-article-body"
      dangerouslySetInnerHTML={{ __html: enhanced }}
    />
  );
}
