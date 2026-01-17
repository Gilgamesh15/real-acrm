import type { LoaderFunctionArgs } from "react-router";

const BASE_URL = import.meta.env.VITE_APP_URL;

/**
 * Generates robots.txt file for search engine crawlers
 * Tells search engines what to crawl and where the sitemap is
 */
export async function loader({}: LoaderFunctionArgs) {
  const robotsTxt = `# robots.txt for ${BASE_URL}

# Allow all crawlers to access everything except admin/account areas
User-agent: *
Allow: /

# Block admin area (requires authentication anyway)
Disallow: /admin/
Disallow: /api/

# Block account/user-specific pages (requires authentication)
Disallow: /konto/

# Block auth pages (no SEO value)
Disallow: /zaloguj-sie
Disallow: /zarejestruj-sie
Disallow: /zapomniales-hasla
Disallow: /resetuj-haslo
Disallow: /potwierdz-email

# Block order success pages (one-time use, contains personal info)
Disallow: /zamowienie/*/sukces

# Block return pages (contains personal info)
Disallow: /zwroty/sukces/

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    },
  });
}
