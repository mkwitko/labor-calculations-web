import { useRef } from "react";

const MIN_SUBMIT_MS = 3500;

export function useHoneypot() {
  const honeypotRef = useRef<HTMLInputElement>(null);
  const mountedAt = useRef(Date.now());

  const isBot = (): boolean => {
    const filled = !!honeypotRef.current?.value;
    const tooFast = Date.now() - mountedAt.current < MIN_SUBMIT_MS;
    return filled || tooFast;
  };

  const honeypotProps = {
    ref: honeypotRef,
    name: "website",
    type: "text",
    autoComplete: "off",
    tabIndex: -1,
    "aria-hidden": true as const,
    style: {
      position: "absolute" as const,
      width: "1px",
      height: "1px",
      opacity: 0,
      overflow: "hidden",
      pointerEvents: "none" as const,
      left: "-9999px",
    },
  };

  return { honeypotProps, isBot };
}
