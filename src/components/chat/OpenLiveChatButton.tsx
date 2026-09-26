"use client";

import { openLiveChat } from "@/components/chat/open-live-chat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<typeof Button>;

/** Opens the same Agent 000 / live-chat popup as the floating chat icon. */
export function OpenLiveChatButton({
  children,
  className,
  size = "sm",
  prefill = "",
  ...props
}: Omit<ButtonProps, "onClick" | "type" | "asChild"> & {
  prefill?: string;
}) {
  return (
    <Button
      type="button"
      size={size}
      className={cn(className)}
      onClick={() => openLiveChat(prefill)}
      {...props}
    >
      {children}
    </Button>
  );
}
