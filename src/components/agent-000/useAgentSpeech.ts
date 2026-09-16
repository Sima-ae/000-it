"use client";

import { useCallback, useEffect, useState } from "react";

const MUTE_KEY = "tz-agent-000-muted";

/** Common browser/OS voice names that read as female. */
const FEMALE_HINT =
  /\b(female|woman|girl|samantha|karen|moira|fiona|tessa|victoria|susan|kathy|zira|hazel|jenny|linda|heather|allison|ava|emma|serena|natasha|catherine|amelie|anna|petra|ellen|claire|sofie|sophie|katja|ingrid|marie|laura|paulina|helena|sara|sarah|kimberly|melissa|joanna|ivy|salli|nora|alva|eliza|mevrouw)\b/i;

/** Common browser/OS voice names that read as male — avoid for Agent 000. */
const MALE_HINT =
  /\b(male|man|boy|david|mark|alex|daniel|thomas|fred|ralph|xander|bruce|james|john|tom|paul|google uk english male|microsoft david|microsoft mark|microsoft george)\b/i;

function voiceScore(voice: SpeechSynthesisVoice, lang: string, primary: string): number {
  const voiceLang = voice.lang.toLowerCase();
  const name = voice.name;
  let score = 0;

  if (voiceLang === lang || voiceLang.startsWith(`${lang}-`) || voiceLang.startsWith(`${lang}_`)) {
    score += 40;
  } else if (voiceLang.startsWith(primary)) {
    score += 28;
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
  const lang = locale.toLowerCase();
  const primary = lang.slice(0, 2);

  const ranked = [...voices].sort(
    (a, b) => voiceScore(b, lang, primary) - voiceScore(a, lang, primary),
  );
  const best = ranked[0];
  if (!best) return null;

  // Prefer an explicitly female match in the same language when available.
  const femaleMatch = ranked.find(
    (v) =>
      FEMALE_HINT.test(v.name) &&
      !MALE_HINT.test(v.name) &&
      (v.lang.toLowerCase().startsWith(lang) || v.lang.toLowerCase().startsWith(primary)),
  );
  return femaleMatch || best;
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
      const clean = text.replace(/\s+/g, " ").trim();
      if (!clean || muted) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(clean);
      const voice = pickVoice(locale);
      if (voice) utter.voice = voice;
      utter.lang = voice?.lang || locale;
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
