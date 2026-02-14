import type React from "react";

import { useCookieConsent } from "./cookie-provider";

export interface CookieTriggerProps {
  className?: string;
}

/**
 * A trigger button to reopen cookie settings after initial consent
 */
export function CookieTrigger(
  props: Omit<React.ComponentProps<"button">, "onClick">
) {
  const { openSettings, state } = useCookieConsent();

  if (!state.hasConsented) {
    return null;
  }

  return (
    <button onClick={openSettings} {...props}>
      Dostosuj preferencje plików cookies
    </button>
  );
}
