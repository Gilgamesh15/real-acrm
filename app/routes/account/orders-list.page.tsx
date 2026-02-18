import * as schema from "db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { AlertCircleIcon, ArrowUpRightIcon } from "lucide-react";
import { Link, redirect } from "react-router";

import { buttonVariants } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "~/components/ui/empty";
import {
  Error,
  ErrorContent,
  ErrorDescription,
  ErrorMedia,
  ErrorTitle,
} from "~/components/ui/error";

import { OrderCard } from "~/components/features/order-card/order-card";
import { db } from "~/lib/db";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/orders-list.page";

export async function loader({ context }: Route.LoaderArgs) {
  const { session } = context;

  if (!session || session?.user.isAnonymous) {
    throw redirect("/zaloguj-sie", { status: 302 });
  }

  const userId = session.user.id;

  const orders = await db.query.orders.findMany({
    where: eq(schema.orders.userId, userId),
    orderBy: asc(schema.orders.createdAt),
    with: {
      events: {
        orderBy: desc(schema.orderTimelineEvents.timestamp),
        limit: 1,
      },
      items: {
        with: {
          product: {
            with: {
              images: {
                limit: 1,
                orderBy: asc(schema.images.displayOrder),
              },
            },
          },
          piece: {
            with: {
              images: {
                limit: 1,
                orderBy: asc(schema.images.displayOrder),
              },
            },
          },
        },
      },
    },
  });
  return { orders };
}

const PAGE_TITLE = "Zamówienia | ACRM";
export const meta: Route.MetaFunction = () => [{ title: PAGE_TITLE }];

export default function OrdersListPage({ loaderData }: Route.ComponentProps) {
  const { orders } = loaderData;

  if (orders.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Brak zamówień</EmptyTitle>
          <EmptyDescription>
            Tutaj pojawią się Twoje zamówienia, gdy je złożysz.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link
            to="/kategorie"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Przeglądaj produkty
            <ArrowUpRightIcon />
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

export async function ErrorBoundary() {
  return (
    <div className="size-full flex-1 flex flex-col items-center justify-center">
      <Error>
        <ErrorMedia>
          <AlertCircleIcon />
        </ErrorMedia>
        <ErrorContent>
          <ErrorTitle>Wystąpił błąd podczas ładowania zamówień</ErrorTitle>
          <ErrorDescription>
            Spróbuj odświeżyć stronę lub wrócić później.
          </ErrorDescription>
        </ErrorContent>
      </Error>
    </div>
  );
}
