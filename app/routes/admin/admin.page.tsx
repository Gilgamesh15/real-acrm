import { redirect } from "react-router";

import { sessionContext } from "~/context/session-context.server";

import type { Route } from "./+types/admin.page";

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) return redirect("/zaloguj-sie?callbackUrl=/admin");

  if (session.user?.role !== "admin") return redirect("/");

  throw redirect("/admin/ubrania");
}

export default function AdminPage() {
  return <div>AdminPage</div>;
}
