"use client";

import { useEffect, useState } from "react";

export function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame = 0;
    const total = 40;
    const id = window.setInterval(() => {
      frame += 1;
      setCount(Math.round((value * frame) / total));
      if (frame >= total) window.clearInterval(id);
    }, 30);
    return () => window.clearInterval(id);
  }, [value]);

  return <span>{count.toLocaleString("nl-NL")}</span>;
}
