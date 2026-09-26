#!/usr/bin/env tsx
/**
 * Strip legacy “professional guide from Brand:” prefixes in all locales.
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  // MySQL 8 REGEXP_REPLACE — strip everything up to first ": " or " :" at start
  // matching known guide-prefix patterns across locales.
  const patterns: Array<{ name: string; like: string; regex: string }> = [
    {
      name: "nl",
      like: "Professionele handleiding van%",
      regex: "^Professionele handleiding van[^:]*:[[:space:]]*",
    },
    {
      name: "en",
      like: "Professional % guide:%",
      regex: "^Professional[[:space:]]+[^:]*guide:[[:space:]]*",
    },
    {
      name: "de",
      like: "Professionelle Anleitung von%",
      regex: "^Professionelle Anleitung von[^:]*:[[:space:]]*",
    },
    {
      name: "fr",
      like: "Guide professionnel de%",
      regex: "^Guide professionnel de[^:]*:[[:space:]]*",
    },
    {
      name: "es",
      like: "Guía profesional de%",
      regex: "^Guía profesional de[^:]*:[[:space:]]*",
    },
    {
      name: "it",
      like: "Guida professionale %",
      regex: "^Guida professionale[^:]*:[[:space:]]*",
    },
    {
      name: "pt",
      like: "Guia profissional d%",
      regex: "^Guia profissional[^:]*:[[:space:]]*",
    },
    {
      name: "pl",
      like: "Profesjonalny poradnik%",
      regex: "^Profesjonalny poradnik[^:]*:[[:space:]]*",
    },
  ];

  for (const p of patterns) {
    for (const field of ["excerpt", "seoDescription"] as const) {
      try {
        const n = await prisma.$executeRawUnsafe(
          `
          UPDATE KennisbankArticleTranslation
          SET \`${field}\` = TRIM(REGEXP_REPLACE(\`${field}\`, ?, ''))
          WHERE \`${field}\` IS NOT NULL
            AND \`${field}\` LIKE ?
          `,
          p.regex,
          p.like,
        );
        if (n) console.log(`[strip] ${p.name}.${field}=${n}`);
      } catch (error) {
        console.error(`[strip] failed ${p.name}.${field}`, error);
      }
    }
  }

  const left = await prisma.$queryRawUnsafe<
    Array<{ locale: string; c: bigint }>
  >(`
    SELECT locale, COUNT(*) c
    FROM KennisbankArticleTranslation
    WHERE excerpt LIKE 'Professionele handleiding van%'
       OR excerpt LIKE 'Professional % guide:%'
       OR excerpt LIKE 'Professionelle Anleitung von%'
       OR excerpt LIKE 'Guide professionnel de%'
       OR excerpt LIKE 'Guía profesional de%'
       OR excerpt LIKE 'Guida professionale %'
    GROUP BY locale
  `);
  console.log("[strip] remaining", left);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
