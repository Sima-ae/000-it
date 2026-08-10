"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Popup = {
  x: number;
  y: number;
  year: number;
} | null;

/**
 * Soft client-side content guard: blocks common right-click / copy / view-source
 * shortcuts and shows a branded copyright popup on context menu.
 * Not a security boundary — only UX friction.
 */
export function ContentGuard() {
  const [popup, setPopup] = useState<Popup>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function hidePopup() {
      setPopup(null);
    }

    function onContextMenu(event: MouseEvent) {
      event.preventDefault();
      const year = new Date().getFullYear();
      const pad = 12;
      const width = 180;
      const height = 36;
      // Anchor at the click point (like a native context menu), clamped to viewport
      const x = Math.min(
        Math.max(event.clientX, pad),
        window.innerWidth - width - pad,
      );
      const y = Math.min(
        Math.max(event.clientY, pad),
        window.innerHeight - height - pad,
      );
      setPopup({ x, y, year });
    }

    function onCopy(event: ClipboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }
      const selection = window.getSelection()?.toString() ?? "";
      if (!selection) return;
      event.preventDefault();
    }

    function onDragStart(event: DragEvent) {
      const target = event.target;
      if (target instanceof HTMLImageElement || target instanceof HTMLAnchorElement) {
        event.preventDefault();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      const meta = event.metaKey || event.ctrlKey;

      if (
        (meta && (key === "u" || key === "s" || key === "p")) ||
        (meta && event.shiftKey && (key === "i" || key === "j" || key === "c")) ||
        key === "f12"
      ) {
        event.preventDefault();
        return;
      }

      if (meta && (key === "c" || key === "x" || key === "a")) {
        const tag = (event.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || (event.target as HTMLElement)?.isContentEditable) {
          return;
        }
        event.preventDefault();
      }

      if (key === "escape") {
        hidePopup();
      }
    }

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCopy);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", hidePopup, { passive: true });
    window.addEventListener("resize", hidePopup);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCopy);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", hidePopup);
      window.removeEventListener("resize", hidePopup);
    };
  }, []);

  useEffect(() => {
    if (!popup) return;
    const timer = window.setTimeout(() => setPopup(null), 2200);
    return () => window.clearTimeout(timer);
  }, [popup]);

  if (!mounted || !popup) return null;

  return createPortal(
    <div className="z-100" role="status" aria-live="polite">
      <button
        type="button"
        aria-label="Close"
        className="fixed inset-0 bg-white/70 backdrop-blur-[1px]"
        onClick={() => setPopup(null)}
      />
      <div
        className="pointer-events-none fixed rounded-lg px-3.5 py-2 text-center text-xs font-medium tracking-wide text-white shadow-md"
        style={{
          left: `${popup.x}px`,
          top: `${popup.y}px`,
          width: "180px",
          backgroundColor: "#5b3c8b",
        }}
      >
        TripleZero iT © {popup.year}
      </div>
    </div>,
    document.body,
  );
}
