import React from "react";
import { Await, Link } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { buttonVariants } from "~/components/ui/button";
import Image from "~/components/ui/image";

import type { DBQueryResult } from "~/lib/types";
import { getSlugPath } from "~/lib/utils";

import { Logo } from "../logo/logo";

const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL!;
const TIKTOK_URL = import.meta.env.VITE_TIKTOK_URL!;
const YOUTUBE_URL = import.meta.env.VITE_YOUTUBE_URL!;

const SOCIAL_MEDIA_LINKS = [
  {
    label: "Instagram",
    href: INSTAGRAM_URL,
    icon: "https://res.cloudinary.com/dk8cu84v7/image/upload/v1770745834/Instagram_Glyph_Gradient_jis95v.png",
  },
  {
    label: "TikTok",
    href: TIKTOK_URL,
    icon: "https://res.cloudinary.com/dk8cu84v7/image/upload/v1770745820/TikTok_Icon_Black_Circle_zs74uw.png",
  },
  {
    label: "Youtube",
    href: YOUTUBE_URL,
    icon: "https://res.cloudinary.com/dk8cu84v7/image/upload/v1770745828/yt_icon_red_digital_jnen7h.png",
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
    <footer className="bg-background">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid gap-10 pb-6 md:grid-cols-2 md:pb-0">
          {/* Left Column: Logo & Social */}
          <div className="flex flex-col justify-start gap-8">
            {/* Logo */}
            <Logo className="w-fit" />

            {/* Social Media Links */}
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
                  <Image
                    src={link.icon}
                    alt={link.label}
                    width={32}
                    title={link.label}
                    height={32}
                    aspectRatio={1}
                    lazyload
                    resize="fill"
                    className="invert dark:invert-0 size-8"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Navigation Links */}
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

        {/* Decorative Logo Image */}
        <div className="overflow-hidden h-22 opacity-10">
          <span className="text-[120px] font-black tracking-tighter text-foreground leading-none">
            ACRM
          </span>
        </div>
      </div>

      {/* Legal Footer (Variant 1: Minimalist Single Line) */}
      <div
        className="border-t border-border/30 bg-muted/20"
        aria-label="Informacje prawne"
        itemScope
        itemType="https://schema.org/Organization"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-[10px] sm:text-xs text-muted-foreground/70 text-center leading-relaxed">
            <span itemProp="name">{COMPANY_INFO.legalName}</span>
            <span className="mx-2 opacity-40">|</span>
            <span
              itemProp="address"
              itemScope
              itemType="https://schema.org/PostalAddress"
            >
              <span itemProp="streetAddress">{COMPANY_INFO.address}</span>,{" "}
              <span itemProp="postalCode">{COMPANY_INFO.postalCode}</span>{" "}
              <span itemProp="addressLocality">{COMPANY_INFO.city}</span>
            </span>
            <span className="mx-2 opacity-40">|</span>
            <span>
              NIP: <span itemProp="taxID">{COMPANY_INFO.nip}</span>
            </span>
            <span className="mx-2 opacity-40">|</span>
            <span>KRS: {COMPANY_INFO.krs}</span>
            <span className="mx-2 opacity-40">|</span>
            <span>REGON: {COMPANY_INFO.regon}</span>
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground/50 text-center mt-1">
            <a
              href={`mailto:${COMPANY_INFO.email}`}
              itemProp="email"
              className="hover:text-muted-foreground transition-colors"
            >
              {COMPANY_INFO.email}
            </a>
            <span className="mx-2 opacity-40">|</span>
            <a
              href={`tel:${COMPANY_INFO.phone.replace(/\s/g, "")}`}
              itemProp="telephone"
              className="hover:text-muted-foreground transition-colors"
            >
              {COMPANY_INFO.phone}
            </a>
            <span className="mx-2 opacity-40">|</span>
            <span>
              © {new Date().getFullYear()} {COMPANY_INFO.tradeName}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
