/**
 * Local branding photos under `/public/branding/images`.
 * Prefer dedicated `/uploads/fixweb/*` assets for individual service cards
 * when those already exist; use these for page heroes, fallbacks and collage.
 */
export const BRANDING_IMAGES = {
  /** Overhead fist-bump — partnership, culture, closing a deal */
  collaboration: "/branding/images/a2-4.jpg",
  /** Code editor + charts — development, custom software, Next.js */
  development: "/branding/images/img-04.png",
  /** Analyst with impressions/engagement widgets — marketing, analytics */
  marketingAnalytics: "/branding/images/img-06.png",
  /** Flat analytics dashboard UI — AEO/GEO/SEO, analytics optimization */
  analyticsDashboard: "/branding/images/post-13-img.jpg",
  /** Team collaborating around a tablet — about us, consulting */
  teamWorkshop: "/branding/images/project-08.jpg",
  /** Focused professional at laptop in open office — about, project work */
  workplaceFocus: "/branding/images/project-10.jpg",
  /** Tablet CRM / invoices / weekly dynamics — AI tools, dashboards, hosting ops */
  tabletCrm: "/branding/images/tablet-01.png",
  /** Tablet analytics overview — reporting, AI readiness, optimization */
  tabletAnalytics: "/branding/images/tablet-02.png",
  /** Soft 3D cloud + server — hosting / webhosting category heroes (no device bezel) */
  hostingWebhosting: "/branding/images/hosting-webhosting.png",
  /** WordPress admin / dashboard mock — WordPress support category */
  wordpressDashboard: "/branding/wordpress-dashboard.jpg",
  /** Full analytics overview UI — dashboards, AI scan, reporting */
  dashboardOverview: "/branding/images/dashboard-08.png",
  /** Man with laptop + metrics chips — consulting, contact, pricing */
  consultantLaptop: "/branding/images/hero-15-img.png",
  /** Woman with tablet + impressions — marketing, growth, mobile */
  tabletMarketer: "/branding/images/hero-18-img.png",
  /** Social engagement / phone — social media, community, content */
  socialEngagement: "/branding/images/img-11.png",
  /** Pair reviewing laptop + progress — teamwork, about, services */
  duoSuccess: "/branding/images/hero-13-img.png",
} as const;

export type BrandingImageKey = keyof typeof BRANDING_IMAGES;

/** Homepage collage — three branding photos (larger tiles). */
export const BRANDING_COLLAGE: readonly string[] = [
  BRANDING_IMAGES.socialEngagement,
  BRANDING_IMAGES.dashboardOverview,
  BRANDING_IMAGES.consultantLaptop,
];

/** Hero / header visual for a service category page. */
export function brandingImageForServiceGroup(
  groupId: string,
): (typeof BRANDING_IMAGES)[BrandingImageKey] {
  switch (groupId) {
    case "ai":
      return BRANDING_IMAGES.socialEngagement;
    case "optimization":
      return BRANDING_IMAGES.analyticsDashboard;
    case "marketing":
      return BRANDING_IMAGES.duoSuccess;
    case "webdesign":
      return BRANDING_IMAGES.development;
    case "wordpress":
      return BRANDING_IMAGES.wordpressDashboard;
    case "hosting":
      return BRANDING_IMAGES.hostingWebhosting;
    case "design":
      return BRANDING_IMAGES.teamWorkshop;
    default:
      return BRANDING_IMAGES.teamWorkshop;
  }
}

/** Fallback card art when a service has no dedicated `/uploads/fixweb` image. */
export function brandingFallbackForServiceSlug(
  slug: string,
  groupId?: string,
): string | undefined {
  if (
    /nextjs|php-web|html-css|api-integration|custom-webdesign|maatwerk/i.test(
      slug,
    )
  ) {
    return BRANDING_IMAGES.development;
  }
  if (
    /community|social|content-writing|media-creation|audio-video/i.test(slug)
  ) {
    return BRANDING_IMAGES.socialEngagement;
  }
  if (/digital-marketing|advertising|e-commerce$/i.test(slug)) {
    return BRANDING_IMAGES.tabletMarketer;
  }
  if (/analytics|aeo|geo|seo|conversion|speed-optimization/i.test(slug)) {
    return BRANDING_IMAGES.dashboardOverview;
  }
  if (/ai-scan/i.test(slug)) {
    return "/uploads/fixweb/ai-scan.png";
  }
  if (/ai-strateg|ai-consult/i.test(slug)) {
    return BRANDING_IMAGES.consultantLaptop;
  }
  if (/ai-|chatbot|workflow|automat/i.test(slug)) {
    return BRANDING_IMAGES.dashboardOverview;
  }
  if (groupId) return brandingImageForServiceGroup(groupId);
  return undefined;
}

/** Featured / OG image for kennisbank categories and articles. */
export function brandingImageForKennisbank(categorySlug: string): string {
  const slug = (categorySlug || "").toLowerCase();
  if (/wordpress|bloggen/.test(slug)) return BRANDING_IMAGES.wordpressDashboard;
  if (/ai-scan|ai-agents|aeo|geo|seo/.test(slug)) {
    return BRANDING_IMAGES.analyticsDashboard;
  }
  if (/veilig|beveiliging|ssl|firewall|spam/.test(slug)) {
    return BRANDING_IMAGES.tabletCrm;
  }
  if (/hosting|vps|directadmin|cyberpanel|plesk|php|ftp|opslag/.test(slug)) {
    return BRANDING_IMAGES.hostingWebhosting;
  }
  if (/e-mail|webmail|microsoft|mail/.test(slug)) {
    return BRANDING_IMAGES.consultantLaptop;
  }
  if (/domein|dns/.test(slug)) return BRANDING_IMAGES.development;
  if (/shop|pakket|factuur|crm|ticket|account/.test(slug)) {
    return BRANDING_IMAGES.dashboardOverview;
  }
  return BRANDING_IMAGES.tabletAnalytics;
}
