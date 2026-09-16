"use client";

import { useCallback, useEffect, useState } from "react";

const MUTE_KEY = "tz-agent-000-muted";

function pickVoice(locale: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const lang = locale.toLowerCase();
  const primary = lang.slice(0, 2);
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith(lang)) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(primary)) ||
    voices.find((v) => v.default) ||
    voices[0] ||
    null
  );
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
      utter.pitch = 1.05;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utter);
    },
    [locale, muted],
  );

  return { muted, setMuted: setMutedPersist, speaking, speak, cancel };
}
