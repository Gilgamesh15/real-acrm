import { redirect } from "react-router";

import type { Route } from "./+types/admin.page";

export async function loader({ context }: Route.LoaderArgs) {
  const { session } = context;

  if (!session) return redirect("/zaloguj-sie?callbackUrl=/admin");

  if (session.user?.role !== "admin") return redirect("/");

  throw redirect("/admin/users");
}

export default function AdminPage() {
  return <div>AdminPage</div>;
}
