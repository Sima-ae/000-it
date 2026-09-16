"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MUTE_KEY = "tz-agent-000-muted";

/** Common browser/OS voice names that read as female. */
const FEMALE_HINT =
  /\b(female|woman|girl|samantha|karen|moira|fiona|tessa|victoria|susan|kathy|zira|hazel|jenny|linda|heather|allison|ava|emma|serena|natasha|catherine|amelie|anna|petra|claire|sofie|sophie|katja|ingrid|marie|laura|paulina|helena|sara|sarah|kimberly|melissa|joanna|ivy|salli|nora|alva|eliza|colette|fenna|mevrouw|dena)\b/i;

/** Common browser/OS voice names that read as male — avoid for Agent 000. */
const MALE_HINT =
  /\b(male|man|boy|david|mark|alex|daniel|thomas|fred|ralph|xander|bruce|james|john|tom|paul|bart|frank|maarten|arnaud|google uk english male|microsoft david|microsoft mark|microsoft george)\b/i;

/**
 * Belgian / Flemish — never use these for site locale `nl`.
 * Ellen (Apple) is Dutch (Belgium); Bart/Dena/Arnaud are also BE.
 */
const BELGIAN_HINT =
  /\b(belgium|belgie|belgië|belgisch|flemish|vlaams|vlaanderen|nl-be|nl_be|ellen|dena|arnaud|bart)\b/i;

/** Strong Netherlands Dutch female preferences (Apple / Azure / Google). */
const NL_NL_FEMALE_PREFERRED =
  /\b(colette|fenna|google nederlands|microsoft.*netherland|nl-nl.*(female|colette|fenna))\b/i;

/** Netherlands Dutch markers. */
const NL_NL_HINT =
  /\b(netherlands|nederland(?!s belgi)|nederlands \(nederland\)|holland|nl-nl|nl_nl|colette|fenna)\b/i;

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

/** Site locale → preferred BCP-47 voice language (Netherlands Dutch, not Belgian). */
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

function isBelgianVoice(voice: SpeechSynthesisVoice) {
  const lang = normalizeLang(voice.lang);
  const blob = `${voice.name} ${lang}`;
  return lang.startsWith("nl-be") || BELGIAN_HINT.test(blob);
}

function isFemaleVoice(voice: SpeechSynthesisVoice) {
  return FEMALE_HINT.test(voice.name) && !MALE_HINT.test(voice.name);
}

function isNlNetherlands(voice: SpeechSynthesisVoice) {
  const lang = normalizeLang(voice.lang);
  const blob = `${voice.name} ${lang}`;
  if (isBelgianVoice(voice)) return false;
  return (
    lang.startsWith("nl-nl") ||
    lang === "nl" ||
    NL_NL_HINT.test(blob) ||
    NL_NL_FEMALE_PREFERRED.test(blob)
  );
}

function voiceScore(voice: SpeechSynthesisVoice, preferred: string): number {
  const voiceLang = normalizeLang(voice.lang);
  const preferredLang = normalizeLang(preferred);
  const primary = preferredLang.slice(0, 2);
  const name = voice.name;
  const blob = `${name} ${voiceLang}`;
  let score = 0;

  if (voiceLang === preferredLang) score += 100;
  else if (voiceLang.startsWith(`${preferredLang}-`)) score += 85;
  else if (voiceLang.startsWith(`${primary}-`) || voiceLang === primary) score += 30;

  if (primary === "nl") {
    // Hard ban Belgian for Dutch site locale.
    if (isBelgianVoice(voice)) score -= 200;
    if (isNlNetherlands(voice)) score += 60;
    if (NL_NL_FEMALE_PREFERRED.test(blob)) score += 80;
  }

  const preferredFemale = LOCALE_FEMALE_PREFERRED[primary];
  if (preferredFemale?.test(blob)) score += 70;

  if (isFemaleVoice(voice)) score += 45;
  if (MALE_HINT.test(name)) score -= 55;

  // Prefer neural / enhanced / premium when available.
  if (/\b(neural|enhanced|premium|natural|online)\b/i.test(name)) score += 12;
  if (voice.localService) score += 3;
  if (voice.default) score += 1;

  return score;
}

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

  const isPreferredRegion = (v: SpeechSynthesisVoice) => {
    const lang = normalizeLang(v.lang);
    if (primary === "nl") return isNlNetherlands(v);
    return lang === preferredLang || lang.startsWith(`${preferredLang}-`);
  };
  const isFamily = (v: SpeechSynthesisVoice) => {
    const lang = normalizeLang(v.lang);
    if (primary === "nl") return lang.startsWith("nl") && !isBelgianVoice(v);
    if (primary === "no") return lang.startsWith("nb") || lang.startsWith("no");
    return lang.startsWith(primary);
  };
  const preferredFemaleRe = LOCALE_FEMALE_PREFERRED[primary];

  // 1) Named preferred female for this locale/region.
  if (preferredFemaleRe) {
    const named = ranked.find(
      (v) =>
        preferredFemaleRe.test(`${v.name} ${normalizeLang(v.lang)}`) &&
        isFemaleVoice(v) &&
        !(primary === "nl" && isBelgianVoice(v)),
    );
    if (named) return named;
  }

  // 2) Female voice in the preferred region (nl-NL / en-US / …).
  const femalePreferred = ranked.find(
    (v) =>
      isFemaleVoice(v) &&
      isPreferredRegion(v) &&
      !(primary === "nl" && isBelgianVoice(v)),
  );
  if (femalePreferred) return femalePreferred;

  // 3) Female in language family (never Belgian for Dutch).
  const femaleFamily = ranked.find(
    (v) => isFemaleVoice(v) && isFamily(v) && !(primary === "nl" && isBelgianVoice(v)),
  );
  if (femaleFamily) return femaleFamily;

  // 4) Any non-Belgian Netherlands voice (e.g. Xander) beats Belgian Ellen.
  if (primary === "nl") {
    const nlOnly = ranked.find((v) => isNlNetherlands(v));
    if (nlOnly) return nlOnly;
    // Absolute last resort: still avoid Belgian if anything Dutch remains tagged nl.
    const anyNl = ranked.find(
      (v) => normalizeLang(v.lang).startsWith("nl") && !isBelgianVoice(v),
    );
    if (anyNl) return anyNl;
    // Do NOT return Ellen / nl-BE.
    return ranked.find((v) => !isBelgianVoice(v)) || null;
  }

  // 5) Best scored voice for other locales.
  return ranked[0] || null;
}

/** Keep only the spoken answer — drop option lists, URLs and button CTAs. */
function prepareSpeechText(text: string, locale: string): string {
  let out = text.replace(/\r\n/g, "\n").trim();
  const primary = locale.toLowerCase().slice(0, 2);

  // Drop "Gerelateerd / Related" blocks with numbered FAQ/KB options + paths.
  out = out.split(/\n\s*(?:Gerelateerd|Related)\s*:/i)[0] ?? out;

  // Drop human-escalation CTAs (ticket / appointment buttons).
  out = out.replace(
    /\n+\s*(?:Wil je liever een mens|Wil u liever een mens|Prefer a human)\?[\s\S]*$/i,
    "",
  );

  // Drop UI-pointing phrases; keep the question itself.
  out = out.replace(
    /\s*Kies een optie hieronder\s*[—–-]\s*dan geef ik een gericht antwoord\.?/gi,
    "",
  );
  out = out.replace(
    /\s*Pick an option below(?: and I'll give a focused answer)?\.?/gi,
    "",
  );
  out = out.replace(
    /\s*(?:Open een ticket|boek een afspraak|book an appointment|contact (?:us|opnemen)|open a ticket)[^.]*\.?/gi,
    "",
  );

  // Strip URLs and site paths TTS would read letter by letter.
  out = out.replace(/https?:\/\/\S+/gi, " ");
  out = out.replace(/(?:^|\s)\/(?:nl|en|[a-z]{2})(?:\/[^\s]*)?/gi, " ");
  out = out.replace(/#[\w\-]+/g, " ");

  // Strip list markers / labels leftover from option dumps.
  out = out.replace(/^\s*\d+\.\s*\[[^\]]+\]\s*.*$/gm, "");
  out = out.replace(/\[(?:FAQ|Kennisbank|Knowledge base)\]/gi, "");
  out = out.replace(/^\s*[-•*]\s+/gm, "");

  // Collapse whitespace / empty lines into calm spoken prose.
  out = out
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?…])/g, "$1")
    .trim();

  if (primary === "nl") {
    // "FAQ" is often read like a swear word in Dutch TTS.
    out = out.replace(/\bF\.?\s*A\.?\s*Q\.?s?\b/gi, "veelgestelde vragen");
  }

  return out;
}

/** Split into short spoken beats so TTS does not race through a wall of text. */
function splitSpeechBeats(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?…;:])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 1) return text ? [text] : [];

  // Merge tiny fragments so it does not sound choppy.
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
    // Some browsers populate voices asynchronously without a reliable event.
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
        const primary = preferred.slice(0, 2).toLowerCase();
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
          if (voice) utter.voice = voice;
          utter.lang = primary === "nl" ? "nl-NL" : preferred;
          // Calm pacing — previous 1.02 felt rushed and tripped over lists.
          utter.rate = 0.88;
          utter.pitch = female ? 1.06 : 1.16;

          utter.onstart = () => {
            if (gen === speakGenRef.current) setSpeaking(true);
          };
          utter.onend = () => {
            if (gen !== speakGenRef.current) return;
            // Tiny pause between beats.
            window.setTimeout(speakNext, 180);
          };
          utter.onerror = () => {
            if (gen === speakGenRef.current) setSpeaking(false);
          };
          window.speechSynthesis.speak(utter);
        };

        speakNext();
      };

      // Wait briefly for voice list if it has not loaded yet.
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
