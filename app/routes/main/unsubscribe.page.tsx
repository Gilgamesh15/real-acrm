import { CheckCircle2, XCircle } from "lucide-react";
import { data } from "react-router";

import { api } from "~/api/api";
import "~/lib/utils";

import type { Route } from "./+types/unsubscribe.page";

export const meta: Route.MetaFunction = () => [
  { title: "Wypisz się z newslettera | ACRM" },
  { robots: "noindex, nofollow" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return data({
      status: 404 as const,
      body: { message: "Nieprawidłowy link." },
    });
  }

  return await api.newsletter.unsubscribe({ body: { token } });
}

export default function UnsubscribePage({ loaderData }: Route.ComponentProps) {
  const result = loaderData;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="max-w-md text-center space-y-4">
        {result.status === 200 && (
          <>
            <CheckCircle2 className="size-12 text-success-foreground mx-auto" />
            <h1 className="text-xl font-semibold">Wypisano z newslettera</h1>
            <p className="text-muted-foreground">
              Nie będziesz już otrzymywać wiadomości marketingowych od ACRM.
            </p>
          </>
        )}

        {result.status === 400 && (
          <>
            <XCircle className="size-12 text-destructive mx-auto" />
            <h1 className="text-xl font-semibold">Wystąpił błąd</h1>
            <p className="text-muted-foreground">
              Nie udało się wypisać z newslettera. Link mógł wygasnąć lub być
              nieprawidłowy. Skontaktuj się z nami, jeśli problem się powtarza.
            </p>
          </>
        )}

        {result.status === 404 && (
          <>
            <XCircle className="size-12 text-destructive mx-auto" />
            <h1 className="text-xl font-semibold">Nieprawidłowy link</h1>
            <p className="text-muted-foreground">
              Link mógł wygasnąć lub być nieprawidłowy. Skontaktuj się z nami,
              jeśli problem się powtarza.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
