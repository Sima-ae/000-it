"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MUTE_KEY = "tz-agent-000-muted";

/** Common browser/OS voice names that read as female. */
const FEMALE_HINT =
  /\b(female|woman|girl|samantha|karen|moira|fiona|tessa|victoria|susan|kathy|zira|hazel|jenny|linda|heather|allison|ava|emma|serena|natasha|catherine|amelie|anna|petra|claire|sofie|sophie|katja|ingrid|marie|laura|paulina|helena|sara|sarah|kimberly|melissa|joanna|ivy|salli|nora|alva|eliza|colette|fenna|ellen|mevrouw|dena)\b/i;

/** Common browser/OS voice names that read as male — avoid for Agent 000. */
const MALE_HINT =
  /\b(male|man|boy|david|mark|alex|daniel|thomas|fred|ralph|xander|bruce|james|john|tom|paul|bart|frank|maarten|arnaud|google uk english male|microsoft david|microsoft mark|microsoft george)\b/i;

/** Belgian region markers (accent), not a hard ban when no NL female exists. */
const BELGIAN_REGION =
  /\b(belgium|belgie|belgië|belgisch|flemish|vlaams|vlaanderen|nl-be|nl_be)\b/i;

/** Best Netherlands Dutch female voices (Apple / Azure / Chrome). */
const NL_NL_FEMALE_PREFERRED =
  /\b(colette|fenna|google nederlands|microsoft\s+(?:fenna|colette)|nl-nl.*(female|colette|fenna))\b/i;

/** Preferred female voices per language family. */
const LOCALE_FEMALE_PREFERRED: Record<string, RegExp> = {
  nl: NL_NL_FEMALE_PREFERRED,
  en: /\b(samantha|karen|zira|google us english|google uk english female|microsoft .*english.*female|ava|emma|jenny|aria)\b/i,
  de: /\b(anna|petra|google deutsch|hedda|katja)\b/i,
  fr: /\b(amelie|google français|marie|denise|hortense)\b/i,
  es: /\b(monica|paulina|google español|elvira|sabina)\b/i,
  pt: /\b(joana|luciana|google português|fernanda)\b/i,
  it: /\b(alice|elsa|google italiano|bianca)\b/i,
};

/** Site locale → preferred BCP-47 voice language. */
function preferredVoiceLang(locale: string): string {
  const primary = locale.toLowerCase().slice(0, 2);
  if (primary === "nl") return "nl-NL";
  if (primary === "en") return "en-US";
  if (primary === "de") return "de-DE";
  if (primary === "fr") return "fr-FR";
  if (primary === "es") return "es-ES";
  if (primary === "pt") return "pt-PT";
  if (primary === "it") return "it-IT";
  if (primary === "pl") return "pl-PL";
  if (primary === "sv") return "sv-SE";
  if (primary === "da") return "da-DK";
  if (primary === "no") return "nb-NO";
  if (primary === "fi") return "fi-FI";
  if (primary === "ru") return "ru-RU";
  if (primary === "ja") return "ja-JP";
  if (primary === "zh") return "zh-CN";
  if (primary === "ar") return "ar-SA";
  if (primary === "tr") return "tr-TR";
  return locale.includes("-") ? locale : `${primary}-${primary.toUpperCase()}`;
}

function normalizeLang(lang: string) {
  return lang.toLowerCase().replace(/_/g, "-");
}

function voiceBlob(voice: SpeechSynthesisVoice) {
  return `${voice.name} ${normalizeLang(voice.lang)}`;
}

function isBelgianRegion(voice: SpeechSynthesisVoice) {
  const lang = normalizeLang(voice.lang);
  return lang.startsWith("nl-be") || BELGIAN_REGION.test(voiceBlob(voice));
}

function isFemaleVoice(voice: SpeechSynthesisVoice) {
  const name = voice.name;
  if (MALE_HINT.test(name)) return false;
  return FEMALE_HINT.test(name);
}

function isMaleVoice(voice: SpeechSynthesisVoice) {
  return MALE_HINT.test(voice.name) && !FEMALE_HINT.test(voice.name);
}

function isDutchFamily(voice: SpeechSynthesisVoice) {
  return normalizeLang(voice.lang).startsWith("nl");
}

function isNlNetherlands(voice: SpeechSynthesisVoice) {
  const lang = normalizeLang(voice.lang);
  if (isBelgianRegion(voice)) return false;
  return (
    lang.startsWith("nl-nl") ||
    lang === "nl" ||
    NL_NL_FEMALE_PREFERRED.test(voiceBlob(voice))
  );
}

function voiceScore(voice: SpeechSynthesisVoice, preferred: string): number {
  const voiceLang = normalizeLang(voice.lang);
  const preferredLang = normalizeLang(preferred);
  const primary = preferredLang.slice(0, 2);
  const blob = voiceBlob(voice);
  let score = 0;

  if (voiceLang === preferredLang) score += 90;
  else if (voiceLang.startsWith(`${preferredLang}-`)) score += 75;
  else if (voiceLang.startsWith(`${primary}-`) || voiceLang === primary) score += 35;

  // Agent 000 is always female — gender outweighs region.
  if (isFemaleVoice(voice)) score += 120;
  if (isMaleVoice(voice)) score -= 140;

  if (primary === "nl") {
    if (NL_NL_FEMALE_PREFERRED.test(blob)) score += 100;
    if (isNlNetherlands(voice) && isFemaleVoice(voice)) score += 80;
    if (isNlNetherlands(voice)) score += 40;
    // Soft penalty only: Ellen (BE female) still beats Xander (NL male).
    if (isBelgianRegion(voice)) score -= 25;
    if (/\bxander\b/i.test(voice.name)) score -= 160;
  }

  const preferredFemale = LOCALE_FEMALE_PREFERRED[primary];
  if (preferredFemale?.test(blob)) score += 70;

  if (/\b(neural|enhanced|premium|natural|online)\b/i.test(voice.name)) score += 15;
  if (voice.localService) score += 3;
  if (voice.default) score += 1;

  return score;
}

/**
 * Pick Agent 000 voice:
 * - Always prefer female
 * - For Dutch: Colette / Fenna / Google Nederlands first, then any female Dutch
 *   (Ellen) rather than male Xander
 * - For other locales: matching-language female
 */
function pickVoice(locale: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferred = preferredVoiceLang(locale);
  const preferredLang = normalizeLang(preferred);
  const primary = preferredLang.slice(0, 2);

  const ranked = [...voices].sort(
    (a, b) => voiceScore(b, preferred) - voiceScore(a, preferred),
  );

  const isFamily = (v: SpeechSynthesisVoice) => {
    const lang = normalizeLang(v.lang);
    if (primary === "nl") return lang.startsWith("nl");
    if (primary === "no") return lang.startsWith("nb") || lang.startsWith("no");
    return lang.startsWith(primary);
  };

  if (primary === "nl") {
    // 1) Best NL-Netherlands female (Colette / Fenna / Google Nederlands).
    const nlFemalePreferred = ranked.find(
      (v) =>
        isFemaleVoice(v) &&
        (NL_NL_FEMALE_PREFERRED.test(voiceBlob(v)) ||
          (isNlNetherlands(v) && isFemaleVoice(v))),
    );
    if (nlFemalePreferred) return nlFemalePreferred;

    // 2) Any female Dutch voice (includes Ellen on macOS when Colette isn't installed).
    const anyDutchFemale = ranked.find((v) => isFemaleVoice(v) && isDutchFamily(v));
    if (anyDutchFemale) return anyDutchFemale;

    // 3) Female voice that can speak Dutch tags even if name is odd.
    const femaleNlLang = ranked.find(
      (v) => isFemaleVoice(v) && normalizeLang(v.lang).startsWith("nl"),
    );
    if (femaleNlLang) return femaleNlLang;

    // 4) Last resort: non-Xander Dutch, then anything non-male.
    const nonXanderDutch = ranked.find(
      (v) => isDutchFamily(v) && !/\bxander\b/i.test(v.name),
    );
    if (nonXanderDutch) return nonXanderDutch;
    return ranked.find((v) => !isMaleVoice(v)) || ranked[0] || null;
  }

  // Other languages: named preferred female → female in family → best score.
  const preferredFemaleRe = LOCALE_FEMALE_PREFERRED[primary];
  if (preferredFemaleRe) {
    const named = ranked.find(
      (v) => preferredFemaleRe.test(voiceBlob(v)) && isFemaleVoice(v),
    );
    if (named) return named;
  }

  const femaleFamily = ranked.find((v) => isFemaleVoice(v) && isFamily(v));
  if (femaleFamily) return femaleFamily;

  const anyFemale = ranked.find((v) => isFemaleVoice(v));
  if (anyFemale) return anyFemale;

  return ranked[0] || null;
}

/** Keep only the spoken answer — drop option lists, URLs and button CTAs. */
function prepareSpeechText(text: string, locale: string): string {
  let out = text.replace(/\r\n/g, "\n").trim();
  const primary = locale.toLowerCase().slice(0, 2);

  out = out.split(/\n\s*(?:Gerelateerd|Related)\s*:/i)[0] ?? out;
  out = out.replace(
    /\n+\s*(?:Wil je liever een mens|Wil u liever een mens|Prefer a human)\?[\s\S]*$/i,
    "",
  );
  out = out.replace(
    /\s*Kies een optie hieronder\s*[—–-]\s*dan geef ik een gericht antwoord\.?/gi,
    "",
  );
  out = out.replace(
    /\s*Pick an option below(?: and I'll give a focused answer)?\.?/gi,
    "",
  );
  out = out.replace(
    /\s*(?:Open een ticket|maak een afspraak|boek een afspraak|book an appointment|contact (?:us|opnemen)|open a ticket)[^.]*\.?/gi,
    "",
  );
  out = out.replace(/https?:\/\/\S+/gi, " ");
  out = out.replace(/(?:^|\s)\/(?:nl|en|[a-z]{2})(?:\/[^\s]*)?/gi, " ");
  out = out.replace(/#[\w\-]+/g, " ");
  out = out.replace(/^\s*\d+\.\s*\[[^\]]+\]\s*.*$/gm, "");
  out = out.replace(/\[(?:FAQ|Kennisbank|Knowledge base)\]/gi, "");
  out = out.replace(/^\s*[-•*]\s+/gm, "");
  out = out
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?…])/g, "$1")
    .trim();

  if (primary === "nl") {
    out = out.replace(/\bF\.?\s*A\.?\s*Q\.?s?\b/gi, "veelgestelde vragen");
  }

  return out;
}

function splitSpeechBeats(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?…;:])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 1) return text ? [text] : [];

  const beats: string[] = [];
  let buf = "";
  for (const part of parts) {
    const next = buf ? `${buf} ${part}` : part;
    if (!buf || next.length < 90) {
      buf = next;
      continue;
    }
    beats.push(buf);
    buf = part;
  }
  if (buf) beats.push(buf);
  return beats;
}

export function useAgentSpeech(locale: string) {
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const voicesReadyRef = useRef(false);
  const speakGenRef = useRef(0);

  useEffect(() => {
    try {
      setMuted(localStorage.getItem(MUTE_KEY) === "1");
    } catch {
      /* ignore */
    }

    const markReady = () => {
      const list = window.speechSynthesis?.getVoices() || [];
      if (list.length) {
        voicesReadyRef.current = true;
        setVoicesReady(true);
      }
    };

    markReady();
    window.speechSynthesis?.addEventListener?.("voiceschanged", markReady);
    const t1 = window.setTimeout(markReady, 250);
    const t2 = window.setTimeout(markReady, 1000);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.speechSynthesis?.removeEventListener?.("voiceschanged", markReady);
      speakGenRef.current += 1;
      window.speechSynthesis?.cancel();
    };
  }, []);

  const setMutedPersist = useCallback((next: boolean) => {
    setMuted(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (next) {
      speakGenRef.current += 1;
      window.speechSynthesis?.cancel();
      setSpeaking(false);
    }
  }, []);

  const cancel = useCallback(() => {
    speakGenRef.current += 1;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const clean = prepareSpeechText(text, locale);
      if (!clean || muted) return;

      const run = () => {
        const gen = ++speakGenRef.current;
        window.speechSynthesis.cancel();

        const preferred = preferredVoiceLang(locale);
        const voice = pickVoice(locale);
        const female = voice ? isFemaleVoice(voice) : false;
        const beats = splitSpeechBeats(clean);
        let index = 0;

        const speakNext = () => {
          if (gen !== speakGenRef.current) return;
          if (index >= beats.length) {
            setSpeaking(false);
            return;
          }

          const utter = new SpeechSynthesisUtterance(beats[index++]);
          if (voice) {
            utter.voice = voice;
            // Critical: keep lang aligned with the chosen voice.
            // Forcing nl-NL while voice is Ellen (or another female) makes
            // Safari/Chrome swap to Xander (male nl-NL).
            utter.lang = voice.lang || preferred;
          } else {
            utter.lang = preferred;
          }

          utter.rate = 0.88;
          utter.pitch = female ? 1.05 : 1.28;

          utter.onstart = () => {
            if (gen === speakGenRef.current) setSpeaking(true);
          };
          utter.onend = () => {
            if (gen !== speakGenRef.current) return;
            window.setTimeout(speakNext, 180);
          };
          utter.onerror = () => {
            if (gen === speakGenRef.current) setSpeaking(false);
          };
          window.speechSynthesis.speak(utter);
        };

        speakNext();
      };

      if (!voicesReadyRef.current && !window.speechSynthesis.getVoices().length) {
        window.setTimeout(run, 300);
        return;
      }
      run();
    },
    [locale, muted, voicesReady],
  );

  return { muted, setMuted: setMutedPersist, speaking, speak, cancel };
}
