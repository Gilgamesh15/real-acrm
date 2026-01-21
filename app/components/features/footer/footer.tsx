import React from "react";
import { Await, Link } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { buttonVariants } from "~/components/ui/button";

import type { DBQueryResult } from "~/lib/types";
import { getSlugPath } from "~/lib/utils";

import { Logo } from "../logo/logo";
import LogoSmallPng from "/logo-small-dark.png";

const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL!;
const TIKTOK_URL = import.meta.env.VITE_TIKTOK_URL!;
const YOUTUBE_URL = import.meta.env.VITE_YOUTUBE_URL!;

const SOCIAL_MEDIA_LINKS = [
  {
    label: "Instagram",
    href: INSTAGRAM_URL,
    icon: "https://fzfbhbf.stripocdn.email/content/assets/img/social-icons/logo-white/instagram-logo-white.png",
  },
  {
    label: "TikTok",
    href: TIKTOK_URL,
    icon: "https://fzfbhbf.stripocdn.email/content/assets/img/social-icons/logo-white/tiktok-logo-white.png",
  },
  {
    label: "Youtube",
    href: YOUTUBE_URL,
    icon: "https://fzfbhbf.stripocdn.email/content/assets/img/social-icons/logo-white/youtube-logo-white.png",
  },
];

const FOOTER_LINKS = [
  {
    title: "Sklep",
    links: [
      { label: "Strona główna", href: "/" },
      { label: "Projekty", href: "/projekty" },
      { label: "Ubrania", href: "/kategorie" },
      { label: "O nas", href: "/o-nas" },
      { label: "Zwroty", href: "/zwroty" },
    ],
  },
  {
    title: "Kategorie",
    links: [],
  },
  {
    title: "Regulamin",
    links: [
      {
        label: "Polityka prywatności",
        href: "/polityka-prywatnosci",
      },
      { label: "Regulamin", href: "/regulamin" },
      {
        label: "Odstąpienie od umowy",
        href: "/odstapienie-od-umowy",
      },
      { label: "Reklamacje", href: "/reklamacje" },
    ],
  },
];

// DANE FIRMY - UZUPEŁNIJ PONIŻSZE INFORMACJE
const COMPANY_INFO = {
  tradeName: "ACRM Fashion Projects",
  legalName: "ACRM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ",
  address: "ul. Nad Sudołem 24/22", // np. "ul. Przykładowa 123"
  postalCode: "31-228", // np. "00-001"
  city: "Kraków", // np. "Warszawa"
  nip: "9452316835",
  krs: "0001193211", // np. "0000123456"
  regon: "542680140", // np. "12345678901234"
  email: "kontakt@acrm.pl", // lub inny email kontaktowy
  phone: "+48 453-450-597", // np. "+48 123 456 789"
};

function Footer({
  categoriesPromise,
}: {
  categoriesPromise: Promise<
    DBQueryResult<"categories", { with: { image: true } }>[]
  >;
}) {
  return (
    <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
      <div className="grid gap-10 pb-6 md:grid-cols-2 md:pb-0">
        <div className="flex flex-col justify-start gap-8">
          <Logo className="w-fit " size="lg" />
          <div className="flex items-center justify-start gap-4 md:flex-row">
            {SOCIAL_MEDIA_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon",
                })}
                target="_blank"
              >
                <img
                  src={link.icon}
                  alt={link.label}
                  width={32}
                  title={link.label}
                  height={32}
                />
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="hidden md:flex md:gap-10 lg:gap-24 xl:gap-32">
            <React.Suspense
              fallback={FOOTER_LINKS.map((column) => (
                <div className="flex flex-col gap-4" key={column.title}>
                  <h6 className="mb-2 text-sm font-semibold text-nowrap text-foreground uppercase">
                    {column.title}
                  </h6>
                  {column.links.map((link) => (
                    <Link
                      className="text-sm font-medium text-nowrap text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground"
                      key={link.href}
                      to={link.href}
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            >
              <Await resolve={categoriesPromise}>
                {(categories) => {
                  FOOTER_LINKS[1].links = categories.map((category) => ({
                    label: category.name,
                    href: `/kategorie/${getSlugPath(category)}`,
                  }));

                  return FOOTER_LINKS.map((column) => (
                    <div className="flex flex-col gap-4" key={column.title}>
                      <h6 className="mb-2 text-sm font-semibold text-nowrap text-foreground uppercase">
                        {column.title}
                      </h6>
                      {column.links.map((link) => (
                        <Link
                          className="text-sm font-medium text-nowrap text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground"
                          key={link.href}
                          to={link.href}
                          rel="noopener noreferrer"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ));
                }}
              </Await>
            </React.Suspense>
          </div>
          <div className="md:hidden">
            <Accordion type="single" collapsible>
              {FOOTER_LINKS.map((column) => (
                <AccordionItem value={column.title} key={column.title}>
                  <AccordionTrigger className="uppercase">
                    {column.title}
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-2">
                    {column.links.map((link) => (
                      <Link
                        className="text-sm font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground"
                        key={link.href}
                        to={link.href}
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      {/* NOWA SEKCJA: DANE FIRMY */}
      <div className="border-t border-muted-foreground/20 mt-8 pt-8 pb-6">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Kolumna 1: Dane rejestrowe */}
          <div className="text-sm text-muted-foreground space-y-2">
            <h3 className="font-semibold text-foreground mb-3">
              Informacje o firmie
            </h3>
            <p className="font-medium text-foreground">
              {COMPANY_INFO.tradeName}
            </p>
            <p>{COMPANY_INFO.legalName}</p>
            <p>
              {COMPANY_INFO.address}
              <br />
              {COMPANY_INFO.postalCode} {COMPANY_INFO.city}
            </p>
            <div className="pt-2 space-y-1">
              <p>NIP: {COMPANY_INFO.nip}</p>
              <p>KRS: {COMPANY_INFO.krs}</p>
              <p>REGON: {COMPANY_INFO.regon}</p>
            </div>
          </div>

          {/* Kolumna 2: Dane kontaktowe */}
          <div className="text-sm text-muted-foreground space-y-2">
            <h3 className="font-semibold text-foreground mb-3">Kontakt</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Email:</span>{" "}
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="hover:text-foreground transition-colors underline"
                >
                  {COMPANY_INFO.email}
                </a>
              </p>
              <p>
                <span className="font-medium">Telefon:</span>{" "}
                <a
                  href={`tel:${COMPANY_INFO.phone.replace(/\s/g, "")}`}
                  className="hover:text-foreground transition-colors"
                >
                  {COMPANY_INFO.phone}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden h-22 opacity-10">
        <img src={LogoSmallPng} alt="Logo" />
      </div>
    </footer>
  );
}

export { Footer };
