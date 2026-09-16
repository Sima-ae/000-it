"use client";

import { useCallback, useEffect, useState } from "react";

const MUTE_KEY = "tz-agent-000-muted";

/** Common browser/OS voice names that read as female. */
const FEMALE_HINT =
  /\b(female|woman|girl|samantha|karen|moira|fiona|tessa|victoria|susan|kathy|zira|hazel|jenny|linda|heather|allison|ava|emma|serena|natasha|catherine|amelie|anna|petra|ellen|claire|sofie|sophie|katja|ingrid|marie|laura|paulina|helena|sara|sarah|kimberly|melissa|joanna|ivy|salli|nora|alva|eliza|colette|fenna|mevrouw)\b/i;

/** Common browser/OS voice names that read as male — avoid for Agent 000. */
const MALE_HINT =
  /\b(male|man|boy|david|mark|alex|daniel|thomas|fred|ralph|xander|bruce|james|john|tom|paul|bart|frank|google uk english male|microsoft david|microsoft mark|microsoft george)\b/i;

/** Belgian / Flemish markers — avoid when we want Netherlands Dutch. */
const BELGIAN_HINT =
  /\b(belgium|belgie|belgië|belgisch|flemish|vlaams|vlaanderen|nl-be|nl_be)\b/i;

/** Netherlands Dutch markers. */
const NL_NL_HINT =
  /\b(netherlands|nederland|nederlands|holland|nl-nl|nl_nl|colette|fenna)\b/i;

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
  return locale.includes("-") ? locale : `${primary}-${primary.toUpperCase()}`;
}

function normalizeLang(lang: string) {
  return lang.toLowerCase().replace(/_/g, "-");
}

function voiceScore(voice: SpeechSynthesisVoice, preferred: string): number {
  const voiceLang = normalizeLang(voice.lang);
  const preferredLang = normalizeLang(preferred);
  const primary = preferredLang.slice(0, 2);
  const name = voice.name;
  const blob = `${name} ${voiceLang}`;
  let score = 0;

  // Exact region match (e.g. nl-NL) beats generic nl and especially nl-BE.
  if (voiceLang === preferredLang) {
    score += 80;
  } else if (voiceLang.startsWith(`${preferredLang}-`)) {
    score += 70;
  } else if (voiceLang.startsWith(`${primary}-`) || voiceLang === primary) {
    score += 25;
  }

  if (primary === "nl") {
    if (voiceLang.startsWith("nl-be") || BELGIAN_HINT.test(blob)) score -= 90;
    if (voiceLang.startsWith("nl-nl") || NL_NL_HINT.test(blob)) score += 35;
  }

  if (FEMALE_HINT.test(name)) score += 50;
  if (MALE_HINT.test(name)) score -= 60;

  // Prefer local/offline voices when quality is comparable.
  if (voice.localService) score += 4;
  if (voice.default) score += 2;

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

  const isFemale = (v: SpeechSynthesisVoice) =>
    FEMALE_HINT.test(v.name) && !MALE_HINT.test(v.name);
  const isBelgian = (v: SpeechSynthesisVoice) => {
    const lang = normalizeLang(v.lang);
    return lang.startsWith("nl-be") || BELGIAN_HINT.test(`${v.name} ${lang}`);
  };
  const isPreferredRegion = (v: SpeechSynthesisVoice) => {
    const lang = normalizeLang(v.lang);
    return (
      lang === preferredLang ||
      lang.startsWith(`${preferredLang}-`) ||
      (primary === "nl" && (lang.startsWith("nl-nl") || NL_NL_HINT.test(`${v.name} ${lang}`)))
    );
  };
  const isFamily = (v: SpeechSynthesisVoice) =>
    normalizeLang(v.lang).startsWith(primary);

  // 1) Female voice in the preferred region (nl-NL).
  const femalePreferred = ranked.find(
    (v) => isFemale(v) && isPreferredRegion(v) && !(primary === "nl" && isBelgian(v)),
  );
  if (femalePreferred) return femalePreferred;

  // 2) Female Dutch that is not Belgian.
  const femaleNonBe = ranked.find(
    (v) => isFemale(v) && isFamily(v) && !(primary === "nl" && isBelgian(v)),
  );
  if (femaleNonBe) return femaleNonBe;

  // 3) Any female in the language family (Belgian only as last female Dutch option).
  const femaleFamily = ranked.find((v) => isFemale(v) && isFamily(v));
  if (femaleFamily) return femaleFamily;

  return ranked[0] || null;
}

/** Rewrite spoken text so TTS does not mispronounce abbreviations. */
function prepareSpeechText(text: string, locale: string): string {
  let out = text.replace(/\s+/g, " ").trim();
  const primary = locale.toLowerCase().slice(0, 2);

  if (primary === "nl") {
    // "FAQ" is often read like a swear word in Dutch TTS — say the real phrase.
    out = out.replace(/\bF\.?\s*A\.?\s*Q\.?s?\b/gi, "veelgestelde vragen");
  }

  return out;
}

export function useAgentSpeech(locale: string) {
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    try {
      setMuted(localStorage.getItem(MUTE_KEY) === "1");
    } catch {
      /* ignore */
    }
    const warm = () => window.speechSynthesis?.getVoices();
    warm();
    window.speechSynthesis?.addEventListener?.("voiceschanged", warm);
    return () => {
      window.speechSynthesis?.removeEventListener?.("voiceschanged", warm);
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
      window.speechSynthesis?.cancel();
      setSpeaking(false);
    }
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const clean = prepareSpeechText(text, locale);
      if (!clean || muted) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(clean);
      const preferred = preferredVoiceLang(locale);
      const voice = pickVoice(locale);
      if (voice) utter.voice = voice;
      // Force Netherlands Dutch BCP-47 even if the OS voice tag is incomplete.
      utter.lang =
        preferred.startsWith("nl")
          ? "nl-NL"
          : voice?.lang || preferred;
      utter.rate = 1.02;
      // Slightly higher pitch so Agent 000 reads as female even on neutral voices.
      utter.pitch = 1.18;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utter);
    },
    [locale, muted],
  );

  return { muted, setMuted: setMutedPersist, speaking, speak, cancel };
}
