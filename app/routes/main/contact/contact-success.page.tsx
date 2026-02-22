import { ArrowLeftIcon, CheckIcon, MailIcon } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { COMPANY_INFO } from "~/lib/company-info";

import type { Route } from "./+types/contact-success.page";

export const meta: Route.MetaFunction = () => [
  { title: "Kontakt - sukces | ACRM" },
];

export default function ContactSuccessPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="py-16 md:py-32 w-full">
        <div className="container">
          <div>
            <div className="mb-10 flex items-center justify-center md:justify-start">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-foreground/10">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-500 delay-300`}
                >
                  <CheckIcon className="h-7 w-7" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-semibold tracking-tight lg:text-8xl text-center md:text-left text-balance">
              {"Wiadomość wysłana"}
              <sup>*</sup>
            </h1>
          </div>

          <div className="mt-20 flex flex-col justify-between gap-10 lg:flex-row">
            <div
              className={`w-full max-w-md transition-all duration-700 delay-200 ease-out`}
            >
              <p className="tracking-tight text-muted-foreground/50">
                Dziękujemy za kontakt. Odpowiemy na Twoją wiadomość tak szybko,
                jak to możliwe.
              </p>
              <div className="mt-10 flex justify-between">
                <a
                  className="flex items-center gap-1 text-foreground/40 hover:text-foreground transition-colors"
                  href={`tel:${COMPANY_INFO.phoneRaw}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <rect width={14} height={20} x={5} y={2} rx={2} ry={2} />
                    <path d="M12 18h.01" />
                  </svg>{" "}
                  {COMPANY_INFO.phone}
                </a>
                <a
                  className="flex items-center gap-1 text-foreground/40 hover:text-foreground transition-colors"
                  href={`mailto:${COMPANY_INFO.email}`}
                >
                  <MailIcon className="h-4 w-4" aria-hidden="true" />
                  {COMPANY_INFO.email}
                </a>
              </div>
            </div>

            <div
              className={`flex w-full flex-col items-start gap-8 lg:pl-30 transition-all duration-700 delay-400 ease-out`}
            >
              <div className="flex flex-col gap-6 w-full">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="default">
                    <Link to="/">
                      <ArrowLeftIcon className="h-4 w-4" />
                      Strona główna
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/kontakt">Wyślij kolejną wiadomość</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
