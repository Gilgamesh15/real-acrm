import * as schema from "db/schema";
import { desc, eq } from "drizzle-orm";
import { BellOff, DownloadIcon, Trash2 } from "lucide-react";
import React from "react";
import {
  data,
  redirect,
  useFetcher,
  useNavigate,
  useRevalidator,
} from "react-router";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from "~/components/ui/item";
import { Spinner } from "~/components/ui/spinner";

import { authClient } from "~/lib/auth-client";
import { db } from "~/lib/db";

import type { Route } from "./+types/privacy.page";

// ========================== LOADERS ==========================
export async function loader({ context }: Route.LoaderArgs) {
  const { session } = context;

  if (!session || session.user.isAnonymous) {
    throw redirect("/zaloguj-sie", { status: 302 });
  }

  const subscriber = await db.query.newsletterSubscribers.findFirst({
    where: eq(schema.newsletterSubscribers.email, session.user.email),
  });

  const isSubscribed =
    subscriber != null &&
    (subscriber.unsubscribedAt === null ||
      subscriber.subscribedAt > subscriber.unsubscribedAt);

  return {
    userId: session.user.id,
    isNewsletterSubscribed: isSubscribed,
    unsubscribeToken: isSubscribed ? subscriber.unsubscribeToken : null,
  };
}

// ========================== ACTIONS ==========================
enum Intent {
  EXPORT = "export",
  DELETE = "delete",
  UNSUBSCRIBE = "unsubscribe",
}

export async function action({ request, context }: Route.ActionArgs) {
  const { logger } = context;
  const { session } = context;

  if (!session || session.user.isAnonymous) {
    throw redirect("/zaloguj-sie", { status: 302 });
  }

  const userId = session.user.id;
  try {
    const formData = await request.formData();
    const intent = formData.get("intent") as Intent | undefined;
    if (!intent) {
      return data(
        {
          success: false,
          message: "Intent jest wymagany",
          data: null,
          intent: intent ?? null,
        },
        { status: 400 }
      );
    }

    switch (intent) {
      case Intent.EXPORT: {
        const user = await db.query.users.findFirst({
          where: eq(schema.users.id, userId),
          with: {
            orders: {
              with: {
                events: {
                  orderBy: desc(schema.orderTimelineEvents.timestamp),
                },
                items: {
                  with: {
                    product: {
                      with: {
                        images: true,
                        pieces: {
                          with: {
                            brand: true,
                            size: true,
                            images: true,
                            measurements: true,
                          },
                        },
                      },
                    },
                    piece: {
                      with: {
                        brand: true,
                        size: true,
                        images: true,
                        measurements: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!user) {
          return data(
            {
              success: false,
              message: "Użytkownik nie został znaleziony",
              data: null,
              intent,
            },
            { status: 404 }
          );
        }

        logger.info("User data exported", { userId });

        return data(
          {
            success: true,
            message: "Dane zostały eksportowane pomyślnie",
            data: user,
            intent,
          },
          { status: 200 }
        );
      }

      case Intent.UNSUBSCRIBE: {
        const token = formData.get("token") as string | null;

        if (!token) {
          return data(
            {
              success: false,
              message: "Brak tokenu",
              data: null,
              intent,
            },
            { status: 400 }
          );
        }

        await db
          .update(schema.newsletterSubscribers)
          .set({ unsubscribedAt: new Date() })
          .where(eq(schema.newsletterSubscribers.unsubscribeToken, token));

        logger.info("User unsubscribed from newsletter", { userId });

        return data(
          {
            success: true,
            message: "Wypisano z newslettera",
            data: null,
            intent,
          },
          { status: 200 }
        );
      }

      case Intent.DELETE: {
        await db.delete(schema.users).where(eq(schema.users.id, userId));

        logger.info("User account deleted", { userId });

        return data(
          {
            success: true,
            message: "Konto zostało usunięte pomyślnie",
            data: null,
            intent,
          },
          { status: 200 }
        );
      }

      default:
        return data(
          {
            success: false,
            message: "Nieznana akcja",
            data: null,
            intent,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error("Privacy action failed", { error, userId });

    return data(
      { success: false, message: "Wystąpił błąd", data: null, intent: null },
      { status: 500 }
    );
  }
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  try {
    const result = await serverAction();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }

    return result;
  } catch (error) {
    throw data(
      {
        success: false,
        message: "Wystąpił błąd",
        data: null,
        error,
        intent: null,
      },
      { status: 500 }
    );
  }
}

export const meta: Route.MetaFunction = () => [
  { title: "Ustawienia prywatności | ACRM" },
];

export default function PrivacyPage({ loaderData }: Route.ComponentProps) {
  const { isNewsletterSubscribed, unsubscribeToken } = loaderData;
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const isDeleting =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("intent") === Intent.DELETE;
  const isExporting =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("intent") === Intent.EXPORT;
  const isUnsubscribing =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("intent") === Intent.UNSUBSCRIBE;
  const isLoading = fetcher.state !== "idle";

  const onExportData = async () => {
    if (isLoading) return;

    await fetcher.submit(
      {
        intent: Intent.EXPORT,
      },
      { method: "POST" }
    );
  };

  React.useEffect(() => {
    if (
      fetcher.data?.intent === Intent.EXPORT &&
      fetcher.state === "idle" &&
      fetcher.data?.success &&
      fetcher.data.data
    ) {
      const result = fetcher.data.data;

      const jsonString = JSON.stringify(result, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create download link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `dane-osobowe-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      fetcher.reset();
    }
  }, [fetcher.formData, fetcher.state, fetcher.data]);

  const onDeleteAccount = () => {
    if (isLoading) return;

    fetcher.submit(
      {
        intent: Intent.DELETE,
      },
      { method: "POST" }
    );
  };

  React.useEffect(() => {
    const handleDelete = async () => {
      if (
        fetcher.data?.intent === Intent.DELETE &&
        fetcher.state === "idle" &&
        fetcher.data?.success &&
        fetcher.data.data
      ) {
        await authClient.signOut();
        navigate("/");
      }
    };

    handleDelete();
  }, [fetcher.formData, fetcher.state, fetcher.data, navigate]);

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Ustawienia prywatności</h1>

      {isNewsletterSubscribed && unsubscribeToken && (
        <Item variant="outline">
          <ItemHeader>
            <ItemTitle>Newsletter</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <ItemDescription>
              Jesteś zapisany/a do newslettera. Możesz w każdej chwili wycofać
              zgodę na otrzymywanie wiadomości marketingowych.
            </ItemDescription>
          </ItemContent>
          <ItemFooter>
            <Button
              onClick={() => {
                if (isLoading) return;
                fetcher.submit(
                  { intent: Intent.UNSUBSCRIBE, token: unsubscribeToken },
                  { method: "POST" }
                );
              }}
              disabled={isUnsubscribing}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {isUnsubscribing ? (
                <>
                  <Spinner />
                  Wypisywanie...
                </>
              ) : (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Wypisz się z newslettera
                </>
              )}
            </Button>
          </ItemFooter>
        </Item>
      )}

      <Item variant="outline">
        <ItemHeader>
          <ItemTitle>Eksportuj dane</ItemTitle>
        </ItemHeader>
        <ItemContent>
          <ItemDescription>
            Pobierz kopię swoich danych w formacie JSON, zawierającą informacje
            o koncie, adresy, historię zamówień i metody płatności.
          </ItemDescription>
        </ItemContent>
        <ItemFooter>
          <Button
            onClick={onExportData}
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            {isExporting ? (
              <>
                <Spinner />
                Eksportowanie...
              </>
            ) : (
              <>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Eksportuj dane
              </>
            )}
          </Button>
        </ItemFooter>
      </Item>

      {/* Delete Account */}
      <Item variant="outline">
        <ItemHeader>
          <ItemTitle>Usuń konto</ItemTitle>
        </ItemHeader>
        <ItemContent>
          <p className="text-sm text-muted-foreground">
            Usunięcie konta spowoduje trwałe usunięcie wszystkich danych
            osobowych. Ta operacja jest nieodwracalna.
          </p>
          <p className="text-sm text-muted-foreground">
            <p className="mb-2">Co zostanie usunięte:</p>
            <p className="text-sm text-muted-foreground">
              Dane osobowe, adresy, metody płatności i dostęp do konta. Historia
              zamówień zostanie zanonimizowana dla celów księgowych.
            </p>
          </p>
        </ItemContent>
        <ItemFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 />
                Usuń konto
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Usuń konto na stałe</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    <strong>Ta operacja jest nieodwracalna.</strong> Usunięcie
                    konta spowoduje:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Trwałe usunięcie wszystkich danych osobowych</li>
                    <li>Usunięcie adresów dostawy i metod płatności</li>
                    <li>
                      Anonimizację historii zamówień (dane pozostają dla celów
                      księgowych)
                    </li>
                    <li>
                      Utratę dostępu do konta i wszystkich powiązanych usług
                    </li>
                  </ul>
                  <p className="pt-2">
                    Czy na pewno chcesz usunąć swoje konto?
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={onDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Spinner />
                      Usuwanie...
                    </>
                  ) : (
                    <>
                      <Trash2 />
                      Usuń konto na stałe
                    </>
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ItemFooter>
      </Item>
    </div>
  );
}

export function ErrorBoundary() {
  const revalidator = useRevalidator();

  return (
    <div className="size-full flex-1 flex flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Wystąpił błąd</h2>
        <p className="text-muted-foreground mb-4">
          Spróbuj odświeżyć stronę lub wrócić później.
        </p>
        <Button onClick={revalidator.revalidate} variant="default">
          Odśwież stronę
        </Button>
      </div>
    </div>
  );
}
