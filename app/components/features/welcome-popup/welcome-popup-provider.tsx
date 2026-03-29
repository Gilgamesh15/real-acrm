import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";

import { api } from "~/api/api";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { authClient } from "~/lib/auth-client";

const ALLOWED_PATHS = ["/", "/ubrania", "/kategorie", "/projekty"];

type WelcomePopupContextValue = {
  open: boolean;
  isSubscribed: boolean | undefined;
  handleForceOpen: () => void;
  handleSubscribe: (email: string) => Promise<void>;
  handleOpenChange: (next: boolean) => void;
};

const WelcomePopupContext =
  React.createContext<WelcomePopupContextValue | null>(null);

export function useWelcomePopup() {
  const context = React.useContext(WelcomePopupContext);

  if (!context) {
    throw new Error("useWelcomePopup must be used within WelcomePopupProvider");
  }

  return context;
}

export function WelcomePopupProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [dismissedAt, setDismissedAt] = useLocalStorage<number | null>(
    "welcome-popup-dismissed-at",
    null
  );
  // Phase 1 - managing setup of the listener for the popup
  const listenerArmedRef = React.useRef(false); // latch — never resets
  const listenerFnRef = React.useRef<(() => void) | null>(null); // handle
  const session = authClient.useSession.get();
  const {
    data: subscriber,
    isLoading: _isLoadingSubscriber,
    isRefetching: isRefetchingSubscriber,
    isError: isErrorFetchingSubscriber,
  } = useQuery({
    queryKey: ["newsletter", "subscriber", session.data?.user?.email],
    queryFn: () =>
      api.newsletter.byEmail
        .get({
          params: { email: session.data?.user?.email! },
        })
        .then((res) => {
          if (res.status === 200) {
            return res.body.subscriber;
          }
          throw new Error(res.body.message);
        }),
    enabled: !!session.data?.user?.email,
  });
  const location = useLocation();
  const isSubscribed = React.useMemo(
    () => subscriber?.subscribed,
    [subscriber]
  );
  const isLoadingSubscriber = React.useMemo(
    () => _isLoadingSubscriber || isRefetchingSubscriber,
    [_isLoadingSubscriber, isRefetchingSubscriber]
  );

  const setupListenerFlag = React.useMemo(() => {
    // 1. Skip if wrong page
    if (!ALLOWED_PATHS.some((path) => location.pathname.startsWith(path)))
      return false;

    // 2. Skip if dismissed in the last 30 days
    const isDismissedInLast30Days = dismissedAt
      ? Date.now() - dismissedAt < 30 * 24 * 60 * 60 * 1000
      : false;
    if (isDismissedInLast30Days) return false;

    // 3. Skip if awaiting response from the server or error
    if (isLoadingSubscriber || isErrorFetchingSubscriber) return false;

    // 4. Skip if already subscribed
    if (isSubscribed === true) return false;

    return true;
  }, [
    dismissedAt,
    isErrorFetchingSubscriber,
    isLoadingSubscriber,
    isSubscribed,
    location.pathname,
  ]);

  React.useEffect(() => {
    if (!setupListenerFlag || listenerArmedRef.current) return;

    listenerArmedRef.current = true; // permanent latch, independent of listener lifecycle

    listenerFnRef.current = () => {
      if (
        window.scrollY / (document.body.scrollHeight - window.innerHeight) >
        0.4
      ) {
        setOpen(true);
        window.removeEventListener("scroll", listenerFnRef.current!);
        listenerFnRef.current = null; // safe to null — latch is separate
      }
    };

    window.addEventListener("scroll", listenerFnRef.current);
    return () => {
      if (listenerFnRef.current) {
        window.removeEventListener("scroll", listenerFnRef.current);
        listenerFnRef.current = null;
      }
    };
  }, [setupListenerFlag]);

  // Phase 2 - managing the popup state
  const {
    mutateAsync: subscribe,
    isPending: isSubscribing,
    isSuccess: didSubscribeSucceed,
  } = useMutation({
    mutationKey: ["newsletter", "subscribe", session.data?.user?.email],
    mutationFn: (email: string) =>
      api.newsletter
        .subscribe({
          body: { email },
        })
        .then((res) => {
          if (res.status === 201) {
            return res.body.subscriber;
          }
          console.error(res.body);
          throw new Error(res.body.message);
        }),
  });

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      // 1. Ignore closing if state is ambiguous - we are in the process of subscribing
      if (isSubscribing) return;

      // 2. If closing and not subscribed treat as dismiss
      if (!didSubscribeSucceed && !next) setDismissedAt(Date.now());

      // 3. Ignore opening if already subscribed
      if (isSubscribed && next) return;

      // 4. Otherwise update the state
      setOpen(next);
    },
    [didSubscribeSucceed, isSubscribed, isSubscribing, setDismissedAt]
  );

  const handleForceOpen = React.useCallback(() => {
    // 1. Force phase 1 to cease
    listenerArmedRef.current = true;

    // Clean up the listener if it is set up
    if (listenerFnRef.current) {
      window.removeEventListener("scroll", listenerFnRef.current);
      listenerFnRef.current = null;
    }

    setOpen(true);
  }, []);

  const handleSubscribe = React.useCallback(
    async (email: string) => {
      // 1. Ignore if already pending subscription or already subscribed
      if (isSubscribing || isSubscribed || didSubscribeSucceed) return;

      // 2. Subscribe
      toast.promise(subscribe(email), {
        loading: "Subskrybujemy...",
        success: "Subskrypcja zakończona",
        error: (err) => {
          if (err instanceof Error) {
            return err.message;
          }
          return "Nie udało się subskrybować";
        },
      });
    },
    [isSubscribing, isSubscribed, didSubscribeSucceed, subscribe]
  );

  return (
    <WelcomePopupContext.Provider
      value={{
        open,
        // Prioritize the success of api.newsletter.subscribe
        // Secondarily use api.newsletter.byEmail.get as source of truth
        isSubscribed: didSubscribeSucceed || subscriber?.subscribed,
        handleForceOpen,
        handleSubscribe,
        handleOpenChange,
      }}
    >
      {children}
    </WelcomePopupContext.Provider>
  );
}
