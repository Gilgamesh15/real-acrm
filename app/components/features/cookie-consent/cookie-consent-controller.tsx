import { Check, CheckCircle, Cookie, Info } from "lucide-react";
import React from "react";
import { useFetcher, useLoaderData, useNavigate } from "react-router";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";

import type { loader as rootLoader } from "~/root";

function CookieConsentController({ children }: React.PropsWithChildren) {
  const loaderData = useLoaderData<typeof rootLoader>();
  const initialConsentStatus = loaderData?.cookieConsent;
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [consentStatus, setConsentStatus] = React.useState<true | null>(
    initialConsentStatus
  );
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const toastRef = React.useRef<string | number | null>(null);
  const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const saveAcknowledgementCookie = React.useCallback(() => {
    // Submit to server to set cookie
    fetcher.submit(
      {},
      {
        method: "POST",
        action: "/api/cookie-consent",
      }
    );

    setConsentStatus(true);
  }, [fetcher]);

  const dismissToast = () => {
    if (toastRef.current !== null) {
      toast.dismiss(toastRef.current);
      toastRef.current = null;
    }
    if (toastTimeoutRef.current !== null) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  };

  const handleToastAcknowledgement = React.useCallback(() => {
    saveAcknowledgementCookie();
    setIsAlertOpen(false);
    dismissToast();
  }, [saveAcknowledgementCookie]);

  const handleToastDetails = React.useCallback(() => {
    setIsAlertOpen(true);
    dismissToast();
  }, []);

  const handleAlertAcknowledgement = React.useCallback(() => {
    saveAcknowledgementCookie();
    setIsAlertOpen(false);
    dismissToast();
  }, [saveAcknowledgementCookie]);

  React.useEffect(() => {
    if (consentStatus === true) {
      setIsAlertOpen(false);
      dismissToast();
    } else {
      setIsAlertOpen(false);

      // Show toast after 3 seconds if not already shown
      if (toastRef.current === null && toastTimeoutRef.current === null) {
        toastTimeoutRef.current = setTimeout(() => {
          toastRef.current = toast.custom(
            () => (
              <ToastUI
                onAcknowledgement={handleToastAcknowledgement}
                onDetails={handleToastDetails}
              />
            ),
            {
              duration: Infinity,
            }
          );
          toastTimeoutRef.current = null;
        }, 3000);
      }
    }

    return () => {
      if (toastTimeoutRef.current !== null) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
  }, [consentStatus, handleToastAcknowledgement, handleToastDetails]);

  return (
    <>
      {children}
      <AlertUI
        isOpen={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        onPrivacyPolicyClick={() => {
          handleAlertAcknowledgement();
          navigate("/polityka-prywatnosci");
        }}
        onAcknowledgement={handleAlertAcknowledgement}
      />
    </>
  );
}

export { CookieConsentController };

// AlertUI and ToastUI components remain the same...
const AlertUI = ({
  onAcknowledgement,
  onPrivacyPolicyClick,
  isOpen,
  onOpenChange,
}: {
  onAcknowledgement: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPrivacyPolicyClick: () => void;
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <AlertDialogHeader className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Cookie className="w-6 h-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center text-lg md:text-xl">
            Polityka plików cookies
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Jak używamy cookies?</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              W celu realizacji usług dostępnych w naszym sklepie, optymalizacji
              jego treści oraz dostosowania sklepu do Państwa indywidualnych
              potrzeb korzystamy z informacji zapisanych za pomocą plików
              cookies na urządzeniach końcowych użytkowników.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Twoja kontrola</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pliki cookies można kontrolować za pomocą ustawień swojej
              przeglądarki internetowej.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Akceptacja</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Dalsze korzystanie z naszego sklepu internetowego, bez zmiany
              ustawień przeglądarki oznacza akceptację stosowania plików
              cookies.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Więcej informacji zawartych jest w{" "}
              <Button
                variant="link"
                className="inline p-0 m-0 size-fit text-xs"
                onClick={onPrivacyPolicyClick}
              >
                Polityce Prywatności
              </Button>{" "}
              sklepu.
            </p>
          </div>
        </div>

        <AlertDialogFooter className="sm:justify-center">
          <Button
            size="lg"
            className="w-full sm:w-auto gap-2"
            onClick={onAcknowledgement}
          >
            <Check className="w-4 h-4" />
            Rozumiem i akceptuję
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const ToastUI = ({
  onDetails,
  onAcknowledgement,
}: {
  onAcknowledgement: () => void;
  onDetails: () => void;
}) => {
  return (
    <Item
      variant="muted"
      size="sm"
      className="p-2 border shadow-md gap-3 bg-primary-foreground/90 shadow-primary/10 border-primary/15 backdrop-blur-sm"
    >
      <ItemHeader>
        <ItemMedia variant="icon">
          <Cookie />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-sm">
            Ta witryna korzysta z niezbędnych plików cookie.
          </ItemTitle>
          <ItemDescription className="text-xs">
            Kontynuując przeglądanie, zgadzasz się na naszą politykę plików
            cookie.
          </ItemDescription>
        </ItemContent>
      </ItemHeader>
      <ItemActions className="grid grid-cols-2 w-full">
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7"
          onClick={onAcknowledgement}
        >
          <CheckCircle />
          Rozumiem
        </Button>
        <Button
          size="sm"
          className="text-xs h-7"
          variant="default"
          onClick={onDetails}
        >
          <Info />
          Szczegóły
        </Button>
      </ItemActions>
    </Item>
  );
};
