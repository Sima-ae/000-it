import type { AgentLink } from "@/lib/agent-000/ask";

const RELATED_MARKERS = [
  "Related:",
  "Gerelateerd:",
  "Verwandt:",
  "Liés :",
  "Liés:",
  "Relacionado:",
  "Gerelateerde:",
  "Correlati:",
  "Powiązane:",
  "İlgili:",
  "ذات صلة:",
  "संबंधित:",
  "সম্পর্কিত:",
  "متعلقہ:",
  "相关:",
  "関連:",
  "Relacionados:",
  "Súvisiace:",
  "Susiję:",
  "Kapcsolódó:",
  "Σχετικά:",
  "Пов’язані:",
  "Связанные:",
  "İlgili",
];

/**
 * Split an agent answer into visible prose + structured links parsed from the
 * appended numbered list (works for persisted ticket messages without metadata).
 */
export function splitAgentAnswer(body: string): {
  text: string;
  links: AgentLink[];
} {
  const raw = body || "";
  const markerIndex = RELATED_MARKERS.reduce((best, marker) => {
    const idx = raw.lastIndexOf(`\n\n${marker}`);
    const idx2 = raw.lastIndexOf(marker);
    const hit = idx >= 0 ? idx : idx2 === 0 ? 0 : idx2 > 0 && raw[idx2 - 1] === "\n" ? idx2 - 1 : -1;
    return hit > best ? hit : best;
  }, -1);

  if (markerIndex < 0) {
    return { text: raw.trim(), links: parseLooseHrefs(raw) };
  }

  const text = raw.slice(0, markerIndex).trim();
  const section = raw.slice(markerIndex).trim();
  const links = parseNumberedLinkBlock(section);
  return { text, links: links.length ? links : parseLooseHrefs(section) };
}

function parseNumberedLinkBlock(section: string): AgentLink[] {
  const lines = section.split("\n");
  const links: AgentLink[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] || "";
    const m = line.match(/^\s*\d+\.\s*\[([^\]]+)\]\s*(.+?)\s*$/);
    if (!m) continue;
    const label = m[1].trim().toLowerCase();
    const title = m[2].trim();
    const hrefLine = (lines[i + 1] || "").trim();
    if (!hrefLine || !hrefLine.startsWith("/")) continue;
    const kind: AgentLink["kind"] =
      label.includes("faq") || label.includes("veelgestelde")
        ? "faq"
        : label.includes("dienst") ||
            label.includes("service") ||
            label.includes("product") ||
            label.includes("hosting") ||
            label.includes("pakket")
          ? "product"
          : "kennisbank";
    const faqId = hrefLine.includes("#faq-item-")
      ? hrefLine.split("#faq-item-")[1]?.split(/[&#]/)[0]
      : undefined;
    links.push({
      kind,
      title,
      href: hrefLine,
      faqId,
      askQuestion: kind === "faq" ? title : undefined,
      confidence: 0,
    });
    i += 1;
  }
  return links;
}

function parseLooseHrefs(body: string): AgentLink[] {
  const links: AgentLink[] = [];
  const re = /\/[^\s]+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(body))) {
    const href = match[0].replace(/[.,;:)]+$/, "");
    if (!href.startsWith("/")) continue;
    if (links.some((l) => l.href === href)) continue;
    const kind: AgentLink["kind"] = href.includes("/faq") ? "faq" : "kennisbank";
    const faqId = href.includes("#faq-item-")
      ? href.split("#faq-item-")[1]?.split(/[&#]/)[0]
      : undefined;
    links.push({
      kind,
      title: href.split("/").filter(Boolean).slice(-1)[0] || href,
      href,
      faqId,
      confidence: 0,
    });
  }
  return links;
}
