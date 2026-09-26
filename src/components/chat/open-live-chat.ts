/** Dispatched to open the global LiveChatWidget (Agent 000). */
export const OPEN_CHAT_EVENT = "tz-open-live-chat";

export function openLiveChat(prefill = "") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(OPEN_CHAT_EVENT, { detail: { prefill } }),
  );
}
