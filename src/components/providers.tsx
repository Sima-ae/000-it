"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { RouteProgress } from "@/components/shared/RouteProgress";
import { PrefetchPublicRoutes } from "@/components/shared/PrefetchPublicRoutes";

/** Same pattern as catalogus: chat FAB mounts immediately (client-only). */
const LiveChatWidget = dynamic(
  () => import("@/components/chat/LiveChatWidget").then((m) => m.LiveChatWidget),
  { ssr: false },
);

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "light" ? "light" : "dark"}
      richColors
      position="top-right"
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <ThemeProvider>
      <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={null}>
            <RouteProgress />
          </Suspense>
          <PrefetchPublicRoutes />
          {children}
          <LiveChatWidget />
          <ThemedToaster />
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
