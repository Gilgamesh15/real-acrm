import { Mail, MapPin, Phone } from "lucide-react";
import { Heart, Leaf, RefreshCw } from "lucide-react";
import { Clock, RotateCcw, Shield, Truck } from "lucide-react";
import { Package, Shirt, Tag } from "lucide-react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";

import type { Route } from "./+types/about-us.page";

const PAGE_TITLE = "O nas | ACRM";

export const meta: Route.MetaFunction = () => [{ title: PAGE_TITLE }];

export default function AboutUsPage() {
  return (
    <main>
      <HeroSection />
      <MissionSection />
      <WhatWeDoSection />
      <PromisesSection />
      <ContactSection />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-100px)] flex flex-col justify-center px-4 sm:px-6 lg:px-8 pt-16">
      {/* Massive Typography */}
      <div className="max-w-7xl mx-auto w-full">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            O Nas
          </p>

          <h1 className="font-display text-[15vw] md:text-[12vw] lg:text-[10vw] font-bold leading-[0.85] tracking-tighter">
            <span className="block text-balance">Z Wiary</span>
            <span className="block text-balance text-muted-foreground">
              Do Czynu
            </span>
          </h1>

          <div className="max-w-xl pt-8">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              ACRM to polski sklep internetowy sprzedający odzież z drugiej
              ręki. Oferujemy pojedyncze ubrania oraz kuratorskie zestawy
              odzieży.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 md:gap-24">
          {/* Left: Contact Info */}
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Kontakt
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-8">
              Porozmawiajmy
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              Masz pytania o konkretny produkt? Jesteśmy tu, żeby pomóc.
            </p>

            {/* Contact Details */}
            <ItemGroup className="space-y-6">
              <Item asChild size="sm">
                <Link to="mailto:kontakt@acrm.pl">
                  <ItemMedia
                    variant="icon"
                    className="size-12 border bg-secondary"
                  >
                    <Mail className="size-5" />
                  </ItemMedia>
                  <ItemContent className="gap-0">
                    <ItemTitle className="text-sm text-muted-foreground">
                      Email
                    </ItemTitle>
                    <ItemDescription className="font-display text-lg font-medium text-foreground">
                      kontakt@acrm.pl
                    </ItemDescription>
                  </ItemContent>
                </Link>
              </Item>

              <Item asChild size="sm">
                <Link to="tel:+48453450597">
                  <ItemMedia
                    variant="icon"
                    className="size-12 border bg-secondary"
                  >
                    <Phone className="size-5" />
                  </ItemMedia>
                  <ItemContent className="gap-0">
                    <ItemTitle className="text-sm text-muted-foreground">
                      Telefon
                    </ItemTitle>
                    <ItemDescription className="font-display text-lg font-medium text-foreground">
                      +48 453-450-597
                    </ItemDescription>
                  </ItemContent>
                </Link>
              </Item>

              <Item size="sm">
                <ItemMedia
                  variant="icon"
                  className="size-12 border bg-secondary"
                >
                  <MapPin className="size-5" />
                </ItemMedia>
                <ItemContent className="gap-0">
                  <ItemTitle className="text-sm text-muted-foreground">
                    Adres
                  </ItemTitle>
                  <ItemDescription className="font-display text-lg font-medium text-foreground">
                    ul. Nad Sudołem 24/22
                  </ItemDescription>
                  <ItemDescription className="font-display text-lg font-medium text-foreground">
                    31-228 Kraków, Polska
                  </ItemDescription>
                </ItemContent>
              </Item>

              <Item size="sm">
                <ItemMedia
                  variant="icon"
                  className="size-12 border bg-secondary"
                >
                  <Clock className="size-5" />
                </ItemMedia>
                <ItemContent className="gap-0">
                  <ItemTitle className="text-sm text-muted-foreground">
                    Godziny obsługi
                  </ItemTitle>
                  <ItemDescription className="font-display text-lg font-medium text-foreground">
                    Poniedziałek – Piątek
                  </ItemDescription>
                  <ItemDescription className="font-display text-lg font-medium text-foreground">
                    9:00 – 17:00
                  </ItemDescription>
                </ItemContent>
              </Item>
            </ItemGroup>
          </div>

          {/* Right: CTA */}
          <div className="flex flex-col justify-center">
            <div className="p-8 md:p-12 border border-border rounded-sm bg-background">
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Gotowy na nowy look?
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Sprawdź nasze najnowsze Projekty i Unikaty. Każda sztuka jest
                jedna jedyna — gdy zniknie, zniknie na zawsze.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link to="/kategorie">Przeglądaj Sklep</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/projekty">Zobacz Projekty</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionSection() {
  const values = [
    {
      icon: Heart,
      title: "Pasja",
      description:
        "Każdy projekt to efekt godzin poszukiwań, selekcji i stylizacji. Wierzymy, że moda powinna opowiadać historię.",
    },
    {
      icon: RefreshCw,
      title: "Cyrkulacja",
      description:
        "Dajemy drugie życie wyjątkowym ubraniom. Redukujemy odpady poprzez przemyślaną odsprzedaż premium vintage.",
    },
    {
      icon: Leaf,
      title: "Zrównoważenie",
      description:
        "Circular fashion to nie trend — to przyszłość. Kupując u nas, dbasz o planetę bez kompromisów w stylu.",
    },
  ];

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-24 mb-16 md:mb-24">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Nasza Misja
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Fashion Projects — Nie Tylko Ubrania
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Poza pojedynczymi ubraniami oferujemy kuratorskie projekty —
              stylizowane zestawy ubrań premium brandów jak Nike, Dickies czy
              Carhartt. Każdy{" "}
              <span className="text-foreground font-medium">Projekt</span> to
              kompletna wizja, nie przypadek.
            </p>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {values.map((value) => (
            <Item variant="outline" key={value.title} className="p-6">
              <ItemHeader>
                <ItemMedia variant="icon">
                  <value.icon className="size-8 text-chart-3" />
                </ItemMedia>
              </ItemHeader>
              <ItemContent>
                <ItemTitle className="text-xl font-semibold">
                  {value.title}
                </ItemTitle>
                <ItemDescription className="text-base text-muted-foreground line-clamp-none">
                  {value.description}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </div>
        <div className="mt-16 md:mt-24 pt-8 border-t border-border max-w-3xl">
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Od 2025 roku działamy w Krakowie, tworząc kuratorską ofertę odzieży
            używanej premium w przystępnym zakresie cenowym.
          </p>
        </div>
      </div>
    </section>
  );
}

function PromisesSection() {
  const promises = [
    {
      icon: Truck,
      title: "Darmowa Wysyłka",
      description:
        "InPost — zawsze bezpłatnie, do każdego paczkomatu lub na dowolny adres w Polsce",
    },
    {
      icon: Clock,
      title: "Realizacja w 24h",
      description: "Zamówienia realizujemy w ciągu jednego dnia roboczego",
    },
    {
      icon: RotateCcw,
      title: "14 Dni na Zwrot",
      description: "Pełne prawo do zwrotu bez podania przyczyny",
    },
    {
      icon: Shield,
      title: "Bezpieczna Płatność",
      description: "Stripe — szyfrowane transakcje, ochrona kupującego",
    },
  ];

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-24 mb-16">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Nasze Obietnice
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Kupujesz Bez Ryzyka
            </h2>
          </div>

          <div className="flex flex-col justify-end">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Zakupy u nas to zero stresu. Darmowa dostawa, błyskawiczna
              realizacja i pełne prawo do zwrotu — bo wiemy, że kupowanie
              odzieży online wymaga zaufania.
            </p>
          </div>
        </div>

        {/* Promises Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {promises.map((promise) => (
            <Item variant="outline" key={promise.title}>
              <ItemHeader>
                <ItemMedia variant="icon">
                  <promise.icon className="size-8 text-chart-3" />
                </ItemMedia>
              </ItemHeader>
              <ItemContent>
                <ItemTitle className="text-lg font-semibold">
                  {promise.title}
                </ItemTitle>
                <ItemDescription className="text-sm text-muted-foreground">
                  {promise.description}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </div>

        {/* Policy Links */}
        <div className="mt-12 flex flex-wrap gap-6 text-sm">
          <Link
            to="/regulamin"
            className="text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Regulamin sklepu
          </Link>
          <Link
            to="/reklamacje"
            className="text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Polityka zwrotów
          </Link>
          <Link
            to="/polityka-prywatnosci"
            className="text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Polityka prywatności
          </Link>
          <Link
            to="/odstapienie-od-umowy"
            className="text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Prawo odstąpienia od umowy
          </Link>
        </div>
      </div>
    </section>
  );
}

function WhatWeDoSection() {
  const offerings = [
    {
      icon: Package,
      number: "01",
      title: "Projekty",
      subtitle: "Kompletne stylizacje",
      description:
        "Kuratorskie zestawy ubrań — kurtka + spodnie + kamizelka, wystylizowane w spójną całość. Kupujesz gotowy look, nie szukasz pasujących elementów.",
      highlight: "Rabat przy zakupie całego zestawu",
    },
    {
      icon: Shirt,
      number: "02",
      title: "Unikaty",
      subtitle: "Pojedyncze perełki",
      description:
        "Indywidualne sztuki vintage — od klasycznych Nike po workwearowe Carhartt. Każdy element to one-of-a-kind, bo to używana odzież w dobrym stanie.",
      highlight: "Każdy produkt jest unikalny",
    },
    {
      icon: Tag,
      number: "03",
      title: "Brandy",
      subtitle: "Premium marki",
      description:
        "Specjalizujemy się w markach, które przetrwały próbę czasu: Nike, Dickies, Carhartt, i inne kultowe brandy casual i workwear.",
      highlight: "Nie jesteśmy oficjalnym retailerem",
    },
  ];

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 md:mb-24">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Co Sprzedajemy
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight max-w-3xl">
            Odzież Używana, Premium Jakość
          </h2>
        </div>

        {/* Offerings List */}
        <ItemGroup className="divide-y">
          {offerings.map((offering) => (
            <Item
              variant="default"
              key={offering.number}
              className="grid md:grid-cols-12 gap-6 md:gap-12 py-12"
            >
              {/* Number */}
              <div className="md:col-span-1">
                <span className="font-display text-sm text-muted-foreground">
                  {offering.number}
                </span>
              </div>

              {/* Icon & Title */}
              <div className="md:col-span-3 flex items-start gap-4">
                <offering.icon className="h-6 w-6 text-accent shrink-0 mt-1" />
                <div>
                  <h3 className="font-display text-2xl font-bold">
                    {offering.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {offering.subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-5">
                <p className="text-muted-foreground leading-relaxed">
                  {offering.description}
                </p>
              </div>

              {/* Highlight */}
              <div className="md:col-span-3 flex items-start">
                <span className="inline-block px-3 py-1 text-xs uppercase tracking-wider bg-secondary text-foreground rounded-sm">
                  {offering.highlight}
                </span>
              </div>
            </Item>
          ))}
        </ItemGroup>

        {/* Important Disclosure */}
        <div className="mt-16 p-6 md:p-8 border border-accent/30 bg-accent/5 rounded-sm">
          <div className="flex gap-4">
            <div className="w-1 bg-accent shrink-0" />
            <div>
              <h4 className="font-display font-semibold mb-2">
                Ważna informacja
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Wszystkie produkty w naszym sklepie to{" "}
                <span className="text-foreground font-medium">
                  odzież używana / second-hand
                </span>
                . Nie jesteśmy oficjalnym sprzedawcą żadnej z marek — zajmujemy
                się kuratorską odsprzedażą starannie wyselekcjonowanych sztuk w
                dobrym stanie.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
