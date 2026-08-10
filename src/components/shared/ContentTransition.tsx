"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function ContentTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-0 w-full"
    >
      {children}
    </motion.div>
  );
}
