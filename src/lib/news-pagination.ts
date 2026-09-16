/**
 * News pagination copy uses `{page}` and `{total}` placeholders.
 * Machine translation often rewrites those names (`{página}`, `{sayfa}`, `{页}`),
 * which breaks naive `{page}` string replace.
 */

const PAGE_KEYS = new Set([
  "page",
  "pagina",
  "pagine",
  "seite",
  "strona",
  "strana",
  "stranica",
  "stranka",
  "sayfa",
  "sehife",
  "oldal",
  "sida",
  "side",
  "sivu",
  "puslapis",
  "faqe",
  "pag",
  "ye",
  "页",
  "ページ",
  "страница",
  "сторінка",
  "σελιδα",
  "σελίδα",
  "էջ",
  "გვერდი",
  "صفحة",
  "паге",
]);

const TOTAL_KEYS = new Set([
  "total",
  "totale",
  "toplam",
  "vkupno",
  "вкупно",
  "тотал",
  "всего",
]);

function normalizePlaceholderName(name: string) {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase();
}

function asciiLetters(name: string) {
  return normalizePlaceholderName(name).replace(/[^a-z]/g, "");
}

export function classifyPagePlaceholder(name: string): "page" | "total" | null {
  const normalized = normalizePlaceholderName(name);
  const ascii = asciiLetters(name);
  if (TOTAL_KEYS.has(normalized) || TOTAL_KEYS.has(ascii)) return "total";
  if (PAGE_KEYS.has(normalized) || PAGE_KEYS.has(ascii) || ascii.startsWith("pag")) {
    return "page";
  }
  return null;
}

/** Rewrite translated placeholder names back to `{page}` / `{total}`. */
export function canonicalizeNewsPageOf(template: string) {
  const text = (template || "").trim();
  if (!text) return "Page {page} of {total}";

  const names = [...text.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1]);
  if (!names.length) return `${text} · {page}/{total}`;

  const assigned = new Map<string, "page" | "total">();
  let hasPage = false;
  let hasTotal = false;

  for (const name of names) {
    const kind = classifyPagePlaceholder(name);
    if (kind === "page" && !hasPage) {
      assigned.set(name, "page");
      hasPage = true;
    } else if (kind === "total" && !hasTotal) {
      assigned.set(name, "total");
      hasTotal = true;
    }
  }

  for (const name of names) {
    if (assigned.has(name)) continue;
    if (!hasPage) {
      assigned.set(name, "page");
      hasPage = true;
    } else if (!hasTotal) {
      assigned.set(name, "total");
      hasTotal = true;
    }
  }

  return text.replace(/\{([^{}]+)\}/g, (full, name: string) => {
    const kind = assigned.get(name);
    if (kind === "page") return "{page}";
    if (kind === "total") return "{total}";
    return full;
  });
}

export function formatNewsPageOf(template: string, page: number, total: number) {
  const canonical = canonicalizeNewsPageOf(template);
  return canonical.replaceAll("{page}", String(page)).replaceAll("{total}", String(total));
}
