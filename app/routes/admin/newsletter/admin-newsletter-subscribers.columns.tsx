import type { ColumnDef } from "@tanstack/react-table";
import type { NewsletterSubscriber } from "db/models/newsletter-subscribers.model";
import { CalendarIcon, CheckCircleIcon, MailIcon } from "lucide-react";

import { Badge } from "~/components/ui/badge";

import { createColumnConfigHelper } from "~/components/shared/data-table-filter/core/filters";
import { formatDate } from "~/lib/utils";

const dtf = createColumnConfigHelper<NewsletterSubscriber>();

export const columnsConfig = [
  dtf
    .text()
    .id("email")
    .accessor((row) => row.email)
    .displayName("Email")
    .icon(MailIcon)
    .build(),
  dtf
    .option()
    .id("subscribed")
    .accessor((row) => (row.subscribed ? "active" : "inactive"))
    .displayName("Status")
    .options([
      { label: "Aktywny", value: "active" },
      { label: "Wypisany", value: "inactive" },
    ])
    .icon(CheckCircleIcon)
    .build(),
  dtf
    .date()
    .id("subscribedAt")
    .accessor((row) => row.subscribedAt)
    .displayName("Data subskrypcji")
    .icon(CalendarIcon)
    .build(),
] as const;

export const columns: ColumnDef<NewsletterSubscriber>[] = [
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "subscribed",
    header: "Status",
    cell: ({ row }) => {
      return row.original.subscribed ? (
        <Badge variant="default">Aktywny</Badge>
      ) : (
        <Badge variant="secondary">Wypisany</Badge>
      );
    },
  },
  {
    id: "welcomeCodeSent",
    header: "Kod wysłany",
    cell: ({ row }) => {
      return row.original.welcomeCodeSent ? (
        <Badge variant="default">Tak</Badge>
      ) : (
        <Badge variant="secondary">Nie</Badge>
      );
    },
  },
  {
    id: "subscribedAt",
    accessorKey: "subscribedAt",
    header: "Data subskrypcji",
    cell: ({ row }) => formatDate(row.original.subscribedAt, "short"),
  },
  {
    id: "unsubscribedAt",
    accessorKey: "unsubscribedAt",
    header: "Data wypisania",
    cell: ({ row }) => {
      return row.original.unsubscribedAt
        ? formatDate(row.original.unsubscribedAt, "short")
        : "-";
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Utworzono",
    cell: ({ row }) => formatDate(row.original.createdAt, "short"),
  },
];
