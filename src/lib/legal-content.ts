import importedPages from "@/content/fixweb/imported-pages.json";
import termsNl from "@/content/legal/terms.nl.json";
import privacyNl from "@/content/legal/privacy.nl.json";
import { translateSectionToNl } from "@/content/legal/translate-nl";
import { brandify, type ContentBlock } from "@/lib/fixweb-content";

type ImportedSection = {
  heading: string;
  paragraphs: string[];
  bullets: string[];
};

type ImportedPage = {
  title: string;
  sections: ImportedSection[];
  rawText: string;
};

export type LegalCookieRow = {
  name: string;
  expiration: string;
  function: string;
};

export type LegalCookieVendor = {
  name: string;
  category: string;
  usage: string;
  sharing: string;
  cookies: LegalCookieRow[];
};

export type LegalPageContent = {
  slug: string;
  title: string;
  updatedLabel: string;
  beforeVendors: ContentBlock[];
  cookieVendors: LegalCookieVendor[];
  afterVendors: ContentBlock[];
  related: { href: string; label: string }[];
};

const pages = (importedPages as { pages: Record<string, ImportedPage> }).pages;

const NL_SECTIONS: Record<string, ImportedSection[]> = {
  "terms-and-conditions": termsNl as ImportedSection[],
  "privacy-policy": privacyNl as ImportedSection[],
};

const META: Record<
  string,
  {
    titleEn: string;
    titleNl: string;
    related: { href: string; labelEn: string; labelNl: string }[];
  }
> = {
  "terms-and-conditions": {
    titleEn: "Terms and Conditions",
    titleNl: "Algemene voorwaarden",
    related: [
      { href: "/privacy", labelEn: "Privacy Policy", labelNl: "Privacybeleid" },
      { href: "/cookies", labelEn: "Cookie Policy", labelNl: "Cookiebeleid" },
    ],
  },
  "privacy-policy": {
    titleEn: "Privacy Policy",
    titleNl: "Privacybeleid",
    related: [
      { href: "/cookies", labelEn: "Cookie Policy", labelNl: "Cookiebeleid" },
      {
        href: "/voorwaarden",
        labelEn: "Terms and Conditions",
        labelNl: "Algemene voorwaarden",
      },
    ],
  },
  "cookie-policy": {
    titleEn: "Cookie Policy",
    titleNl: "Cookiebeleid",
    related: [
      { href: "/privacy", labelEn: "Privacy Policy", labelNl: "Privacybeleid" },
      {
        href: "/voorwaarden",
        labelEn: "Terms and Conditions",
        labelNl: "Algemene voorwaarden",
      },
    ],
  },
};

const META_HEADING =
  /^(Name|Naam|Expiration|Verloop|Function|Functie|Functional|Functioneel|Statistics|Statistieken|Statistics \(anonymous\)|Statistieken \(anoniem\)|Marketing|Marketing\/Tracking|Sharing data|Gegevens delen|Usage|Gebruik|Consent|Toestemming|Purpose pending investigation|Doel in onderzoek|Purpose pending|Purpose)$/i;

function isVendorHeading(heading: string, nextHeading?: string) {
  const h = heading.trim();
  if (!h || /^\d+(\.\d+)*\./.test(h) || META_HEADING.test(h)) return false;
  return Boolean(nextHeading && /^(Usage|Gebruik)$/i.test(nextHeading.trim()));
}

function sectionBlocks(section: ImportedSection): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const heading = brandify(section.heading || "").trim();
  if (heading) {
    blocks.push({ type: "heading", text: heading });
  }

  const paragraphs = (section.paragraphs || [])
    .map((p) => brandify(p).replace(/\s*\(click to expand\)\s*/gi, "").trim())
    .filter(Boolean);
  const bullets = (section.bullets || []).map((b) => brandify(b).trim()).filter(Boolean);

  const dataIdx = paragraphs.findIndex((p) =>
    /^(For this purpose we use the following data|Voor dit doel gebruiken wij de volgende gegevens)/i.test(
      p,
    ),
  );
  const basisIdx = paragraphs.findIndex((p) =>
    /^(The basis on which we may process|De grondslag waarop wij deze gegevens mogen verwerken)/i.test(
      p,
    ),
  );
  const retentionIdx = paragraphs.findIndex((p) =>
    /^(Retention period|Bewaartermijn)$/i.test(p),
  );

  if (dataIdx >= 0 && bullets.length) {
    for (let i = 0; i < dataIdx; i++) {
      blocks.push({ type: "paragraph", text: paragraphs[i] });
    }
    blocks.push({ type: "paragraph", text: paragraphs[dataIdx] });
    blocks.push({ type: "list", items: bullets });

    if (basisIdx >= 0) {
      blocks.push({ type: "paragraph", text: paragraphs[basisIdx] });
      if (paragraphs[basisIdx + 1]) {
        blocks.push({ type: "paragraph", text: paragraphs[basisIdx + 1] });
      }
    }
    if (retentionIdx >= 0) {
      blocks.push({ type: "heading", text: paragraphs[retentionIdx] });
      if (paragraphs[retentionIdx + 1]) {
        blocks.push({ type: "paragraph", text: paragraphs[retentionIdx + 1] });
      }
    }
    return blocks;
  }

  const closingIdx = paragraphs.findIndex((p) =>
    /^(If you have any questions|Als u vragen heeft)/i.test(p),
  );

  for (let i = 0; i < paragraphs.length; i++) {
    if (closingIdx >= 0 && i === closingIdx && bullets.length) {
      blocks.push({ type: "list", items: bullets });
    }

    const p = paragraphs[i];
    if (/^(Retention period|Bewaartermijn)$/i.test(p)) {
      blocks.push({ type: "heading", text: p });
      continue;
    }
    if (/^\d+\.\d+\s+\S/.test(p) && p.length < 120 && !/[.!?]$/.test(p)) {
      blocks.push({ type: "heading", text: p });
      continue;
    }
    blocks.push({ type: "paragraph", text: p });
  }

  if (bullets.length && closingIdx < 0) {
    blocks.push({ type: "list", items: bullets });
  }

  return blocks;
}

function parseCookieVendors(sections: ImportedSection[]): {
  before: ContentBlock[];
  vendors: LegalCookieVendor[];
  after: ContentBlock[];
} {
  const placedIdx = sections.findIndex((s) =>
    /^6\.\s*(Placed cookies|Geplaatste cookies)$/i.test(s.heading.trim()),
  );
  if (placedIdx < 0) {
    return {
      before: sections.flatMap(sectionBlocks),
      vendors: [],
      after: [],
    };
  }

  const before = sections.slice(0, placedIdx + 1).flatMap(sectionBlocks);
  const rest = sections.slice(placedIdx + 1);

  const afterIdx = rest.findIndex(
    (s) => /^\d+\.\s+/.test((s.heading || "").trim()) && !/^6\./.test(s.heading),
  );
  const vendorSections = afterIdx >= 0 ? rest.slice(0, afterIdx) : rest;
  const after = (afterIdx >= 0 ? rest.slice(afterIdx) : []).flatMap(sectionBlocks);

  const vendors: LegalCookieVendor[] = [];

  for (let i = 0; i < vendorSections.length; i++) {
    const section = vendorSections[i];
    const heading = (section.heading || "").trim();
    const nextHeading = vendorSections[i + 1]?.heading?.trim();
    if (!isVendorHeading(heading, nextHeading)) continue;

    const vendor: LegalCookieVendor = {
      name: brandify(heading),
      category: brandify((section.paragraphs || [])[0] || ""),
      usage: "",
      sharing: "",
      cookies: [],
    };

    let j = i + 1;
    let pending: Partial<LegalCookieRow> = {};

    const flush = () => {
      if (pending.name || pending.expiration || pending.function) {
        const name = (pending.name || "").trim();
        if (name && name !== "—") {
          vendor.cookies.push({
            name,
            expiration: (pending.expiration || "—").trim() || "—",
            function: (pending.function || "—").trim() || "—",
          });
        }
        pending = {};
      }
    };

    while (j < vendorSections.length) {
      const cur = vendorSections[j];
      const h = (cur.heading || "").trim();
      const nxt = vendorSections[j + 1]?.heading?.trim();
      if (isVendorHeading(h, nxt)) break;

      if (/^(Usage|Gebruik)$/i.test(h)) {
        vendor.usage = brandify(
          (cur.paragraphs || []).join(" ").replace(/\s*Read more\s*$/i, "").trim(),
        );
      } else if (/^(Sharing data|Gegevens delen)$/i.test(h)) {
        vendor.sharing = brandify((cur.paragraphs || []).join(" ").trim());
      } else if (/^(Name|Naam)$/i.test(h)) {
        flush();
        pending.name = brandify((cur.paragraphs || [])[0] || "").trim();
      } else if (/^(Expiration|Verloop)$/i.test(h)) {
        pending.expiration = brandify((cur.paragraphs || [])[0] || "").trim();
      } else if (/^(Function|Functie)$/i.test(h)) {
        pending.function = brandify((cur.paragraphs || [])[0] || "").trim();
      }

      j += 1;
    }

    flush();
    vendors.push(vendor);
    i = j - 1;
  }

  return { before, vendors, after };
}

function resolveSections(slug: string, isNl: boolean): ImportedSection[] {
  if (isNl && NL_SECTIONS[slug]) {
    return NL_SECTIONS[slug];
  }

  const en = pages[slug]?.sections || [];
  if (isNl && slug === "cookie-policy") {
    return en.map(translateSectionToNl);
  }
  return en;
}

export function getLegalPage(slug: string, locale: string = "en"): LegalPageContent | null {
  const page = pages[slug];
  const meta = META[slug];
  if (!page || !meta) return null;

  const isNl = locale.toLowerCase().startsWith("nl");
  const sections = resolveSections(slug, isNl);

  if (slug === "cookie-policy") {
    const parsed = parseCookieVendors(sections);
    return {
      slug,
      title: isNl ? meta.titleNl : meta.titleEn,
      updatedLabel: isNl
        ? "Laatst bijgewerkt op 01-07-2026"
        : "Last updated on 01-07-2026",
      beforeVendors: parsed.before,
      cookieVendors: parsed.vendors,
      afterVendors: parsed.after,
      related: meta.related.map((r) => ({
        href: r.href,
        label: isNl ? r.labelNl : r.labelEn,
      })),
    };
  }

  return {
    slug,
    title: isNl ? meta.titleNl : meta.titleEn,
    updatedLabel: isNl
      ? "Laatst bijgewerkt op 01-07-2026"
      : "Last updated on 01-07-2026",
    beforeVendors: sections.flatMap(sectionBlocks),
    cookieVendors: [],
    afterVendors: [],
    related: meta.related.map((r) => ({
      href: r.href,
      label: isNl ? r.labelNl : r.labelEn,
    })),
  };
}
