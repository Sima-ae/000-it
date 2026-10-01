/**
 * Professional topic playbooks: only keep highly specific, unique guides.
 * Broad niches are handled by unique-longform-guide.ts (one long-form body per slug).
 */
import {
  h2,
  joinBlocks,
  ol,
  p,
  supportOutro,
  tip,
  ul,
  warn,
} from "./html-helpers";

export type Playbook = {
  excerptNl: string;
  excerptEn: string;
  bodyNl: string;
  bodyEn: string;
};

function pack(
  excerptNl: string,
  excerptEn: string,
  nl: string[],
  en: string[],
): Playbook {
  return {
    excerptNl,
    excerptEn,
    bodyNl: joinBlocks(...nl),
    bodyEn: joinBlocks(...en),
  };
}

/** Match the strongest playbook for an article; null if none. */
export function matchPlaybook(input: {
  slug: string;
  title: string;
  topic: string;
  categories: string[];
}): Playbook | null {
  const hay = `${input.slug} ${input.title} ${input.topic} ${input.categories.join(" ")}`.toLowerCase();

  if (/installatron/.test(hay) && /wat-is|what-is|wat is/.test(hay)) {
    return null; // curated
  }

  // Only the classic DirectAdmin Installatron WordPress install — not CyberPanel,
  // not WP.com migrations, not generic "WordPress installeren" niches.
  const isDaInstallatronWp =
    (/handleiding-wordpress-installeren|wp-install-installatron|wordpress-installeren-via-installatron/.test(
      hay,
    ) ||
      (/wordpress installeren/.test(hay) &&
        /installatron/.test(hay) &&
        /directadmin/.test(hay))) &&
    !/cyberpanel|plesk|wordpress\.com|verhuis|migrat/.test(hay);

  if (isDaInstallatronWp) {
    return pack(
      "Installeer WordPress via Installatron in DirectAdmin: domein kiezen, admin aanmaken en controleren.",
      "Install WordPress with Installatron in DirectAdmin: choose domain, create admin, then verify.",
      [
        p(
          `Met Installatron zet je een schone WordPress-installatie op je TripleZero iT hosting zonder handmatig databases of wp-config te maken.`,
          `Werk op het juiste domein en zorg dat de doelmap leeg is (of een bewuste submap), anders overschrijf je bestaande bestanden.`,
        ),
        h2("Voorbereiding"),
        ul([
          "DirectAdmin-login en toegang tot Installatron.",
          "Domeinnaam die al naar deze hosting wijst (A-record/nameservers).",
          "Sterke admin-gebruikersnaam (niet “admin”) en wachtwoord.",
        ]),
        h2("Stappen"),
        ol([
          "Log in op DirectAdmin en open <strong>Installatron Applications Installer</strong> (Web Applications of Advanced Features).",
          "Kies <strong>WordPress</strong> → <strong>Install</strong>.",
          "Selecteer domein en pad: leeg voor de webroot, of bijvoorbeeld <code>/blog</code> voor een submap.",
          "Vul sitetitel, admin-gebruiker, wachtwoord en e-mailadres in.",
          "Schakel optionele “extra plugins” uit als je een minimale installatie wilt.",
          "Rond af en open daarna <code>/wp-admin</code> om in te loggen.",
        ]),
        h2("Controleren"),
        ul([
          "De homepage laadt op het gekozen adres.",
          "wp-admin is bereikbaar met je nieuwe account.",
          "De site staat onder Installatron → My Applications.",
        ]),
        tip("Activeer daarna SSL (Let’s Encrypt) en zet de WordPress-URL’s op https.", "nl"),
        warn("Installeer niet over een bestaande site heen zonder backup en lege map.", "nl"),
        supportOutro("nl", "Wat is Installatron, Let’s Encrypt SSL, WordPress-URL naar HTTPS"),
      ],
      [
        p(
          `Installatron puts a clean WordPress install on your TripleZero iT hosting without creating databases or editing wp-config by hand.`,
          `Use the correct domain and an empty target folder (or an intentional subdirectory), or you may overwrite existing files.`,
        ),
        h2("Preparation"),
        ul([
          "DirectAdmin login and Installatron access.",
          "Domain already pointing at this hosting (A record/nameservers).",
          "Strong admin username (not “admin”) and password.",
        ]),
        h2("Steps"),
        ol([
          "Sign in to DirectAdmin and open <strong>Installatron Applications Installer</strong> (Web Applications or Advanced Features).",
          "Choose <strong>WordPress</strong> → <strong>Install</strong>.",
          "Select domain and path: leave empty for the web root, or e.g. <code>/blog</code> for a subdirectory.",
          "Enter site title, admin user, password and email address.",
          "Disable optional “extra plugins” if you want a minimal install.",
          "Finish, then open <code>/wp-admin</code> and sign in.",
        ]),
        h2("Verify"),
        ul([
          "The homepage loads on the chosen URL.",
          "wp-admin works with your new account.",
          "The site appears under Installatron → My Applications.",
        ]),
        tip("Next, enable SSL (Let’s Encrypt) and set WordPress URLs to https.", "en"),
        warn("Do not install over an existing site without a backup and an empty folder.", "en"),
        supportOutro("en", "What is Installatron, Let’s Encrypt SSL, WordPress URL to HTTPS"),
      ],
    );
  }

  return null;
}
