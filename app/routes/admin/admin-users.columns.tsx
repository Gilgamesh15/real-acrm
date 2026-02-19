import type { ColumnDef } from "@tanstack/react-table";
import * as schema from "db/schema";
import { roleEnum } from "db/schema";
import { CalendarIcon, MailIcon, ShieldIcon, UserIcon } from "lucide-react";

import { Badge } from "~/components/ui/badge";

import { createColumnConfigHelper } from "~/components/shared/data-table-filter/core/filters";
import { formatDate } from "~/lib/utils";

type User = typeof schema.users.$inferSelect;

const dtf = createColumnConfigHelper<User>();

export const columnsConfig = [
  dtf
    .text()
    .id("firstName")
    .accessor((row) => row.firstName)
    .displayName("Imię")
    .icon(UserIcon)
    .build(),
  dtf
    .text()
    .id("lastName")
    .accessor((row) => row.lastName)
    .displayName("Nazwisko")
    .icon(UserIcon)
    .build(),
  dtf
    .text()
    .id("email")
    .accessor((row) => row.email)
    .displayName("Email")
    .icon(MailIcon)
    .build(),
  dtf
    .option()
    .id("role")
    .accessor((row) => row.role)
    .displayName("Rola")
    .options(
      Object.values(roleEnum.enumValues).map((role) => ({
        value: role,
        label: role === "admin" ? "Administrator" : "Użytkownik",
        icon: (
          <Badge
            className="min-w-3 min-h-3 max-h-3 max-w-3 aspect-square p-0 m-0"
            variant={role === "admin" ? "destructive" : "info"}
          ></Badge>
        ),
      }))
    )
    .icon(ShieldIcon)
    .build(),
  dtf
    .number()
    .id("createdAt")
    .accessor((row) => row.createdAt)
    .displayName("Data rejestracji")
    .icon(CalendarIcon)
    .build(),
] as const;

export const columns: ColumnDef<User>[] = [
  {
    id: "firstName",
    accessorKey: "firstName",
    header: "Imię",
  },
  {
    id: "lastName",
    accessorKey: "lastName",
    header: "Nazwisko",
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "role",
    accessorKey: "role",
    header: "Rola",
    cell: ({ row }) => {
      const role = row.getValue("role") as User["role"];
      return (
        <Badge variant={role === "admin" ? "destructive" : "info"}>
          {role === "admin" ? "Administrator" : "Użytkownik"}
        </Badge>
      );
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Data rejestracji",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return formatDate(date);
    },
  },
];
