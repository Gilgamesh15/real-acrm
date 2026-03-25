import { useEffect, useState } from "react";

/**
 * Custom hook that detects when both gtag AND Google Consent Mode are fully initialized
 *
 * This hook is critical for ensuring analytics events (especially purchase events)
 * are sent AFTER consent has been initialized, preventing GA4 from rejecting or
 * misattributing the events.
 *
 * @returns {boolean} true when gtag and consent mode are ready, false otherwise
 *
 * @example
 * ```tsx
 * const isGtagReady = useGtagReady();
 *
 * useEffect(() => {
 *   if (!isGtagReady) return;
 *
 *   // Safe to fire analytics events now
 *   window.gtag?.("event", "purchase", {...});
 * }, [isGtagReady]);
 * ```
 */
export function useGtagReady(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Skip if we're not in the browser
    if (import.meta.env.SSR) {
      return;
    }

    const checkGtagReady = (): boolean => {
      if (!window.gtag) return false;
      if (!window.dataLayer || !Array.isArray(window.dataLayer)) return false;

      const hasConsentInit = window.dataLayer.some((entry) => {
        // GTM object format: { "0": "consent", "1": "default", ... }
        if (entry && typeof entry === "object" && !Array.isArray(entry)) {
          return entry["0"] === "consent" && entry["1"] === "default";
        }
        // Raw gtag array format: ["consent", "default", { ... }]
        if (Array.isArray(entry)) {
          return entry[0] === "consent" && entry[1] === "default";
        }
        return false;
      });

      return hasConsentInit;
    };

    // If already ready, set state immediately
    if (checkGtagReady()) {
      setIsReady(true);
      return;
    }

    // Otherwise, poll with exponential backoff
    const delays = [50, 100, 200, 500, 1000, 1000, 1000]; // Total max ~3.85 seconds
    let currentAttempt = 0;
    let timeoutId: NodeJS.Timeout | null = null;

    const poll = () => {
      if (checkGtagReady()) {
        setIsReady(true);
        return;
      }

      // If we haven't exceeded max attempts, schedule next check
      if (currentAttempt < delays.length) {
        const delay = delays[currentAttempt];
        currentAttempt++;

        timeoutId = setTimeout(poll, delay);
      } else {
        // Max attempts reached - log warning in development
        if (import.meta.env.DEV) {
          console.warn(
            "[useGtagReady] Timeout: gtag or consent mode not initialized after ~4 seconds"
          );
        }
      }
    };

    // Start polling
    poll();

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return isReady;
}
