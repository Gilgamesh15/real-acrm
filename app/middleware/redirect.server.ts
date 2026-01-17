import { redirect } from "react-router";
import type { MiddlewareFunction } from "react-router";

const LEGACY_REDIRECTS: Record<string, string> = {
  "/produkty": "/kategorie/",
  "/produkt": "/kategorie/",
  "/stylizacje": "/kategorie/",
};

export const redirectMiddleware: MiddlewareFunction = async (
  { request },
  next
) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  for (const [legacyPath, targetPath] of Object.entries(LEGACY_REDIRECTS)) {
    if (pathname === legacyPath || pathname.startsWith(`${legacyPath}/`)) {
      return redirect(targetPath, 301);
    }
  }

  return next();
};
