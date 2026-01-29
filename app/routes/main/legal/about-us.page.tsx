import React from "react";

import type { Route } from "./+types/about-us.page";

const PAGE_TITLE = "O nas | ACRM";

export const meta: Route.MetaFunction = () => [{ title: PAGE_TITLE }];

export default function AboutUsPage() {
  React.useEffect(() => {
    window.gtag?.("event", "page_view", {
      page_title: PAGE_TITLE,
      page_location: window.location.href,
    });
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
        {/* Hero section with massive scale */}
        <div className="mb-16 md:mb-32">
          <h1 className="text-[18vw] md:text-[12vw] font-light leading-none tracking-tighter mb-4">
            ACRM
          </h1>
          <p className="text-xs tracking-[0.3em] md:tracking-[0.5em] text-muted-foreground ml-1">
            W CO WIERZYMY
          </p>
        </div>

        {/* Two column layout with dramatic contrast */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 mb-16 md:mb-32">
          <div className="md:col-span-7">
            <p className="text-2xl md:text-4xl font-light leading-tight mb-8 md:mb-16">
              W roku 2022 ówczesne „ACRM&quot; całkowicie odbiegało od tego, co
              teraz widzisz.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Wówczas nasza wizja świata nie była nawet blisko obecnej
              rzeczywistości.
            </p>
          </div>
          <div className="md:col-span-5 flex items-end">
            <div className="space-y-1">
              <p className="text-5xl md:text-6xl font-light">2022</p>
              <p className="text-xs text-muted-foreground tracking-wider">
                POCZĄTEK
              </p>
            </div>
          </div>
        </div>

        {/* Courage section with mixed scales */}
        <div className="mb-16 md:mb-32 border-t border-foreground/10 pt-8 md:pt-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
            <div className="md:col-span-3">
              <h2 className="text-xs tracking-[0.4em] text-muted-foreground md:sticky md:top-8 mb-4 md:mb-0">
                ODWAGA
              </h2>
            </div>
            <div className="md:col-span-9">
              <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-8 md:mb-12">
                Dotykaliśmy wszystkiego, niczym małe dziecko w sklepie z
                nadzieją, że wróci do domu z zabawką w dłoni, lecz raz za razem
                każdy wybór okazywał się rozczarowaniem.
              </p>
              <p className="text-3xl md:text-5xl font-light leading-tight">
                WIARA NIE UMARŁA
              </p>
              <p className="text-lg md:text-xl text-muted-foreground mt-4">
                spowodowała rozwój.
              </p>
            </div>
          </div>
        </div>

        {/* Pull quote with extreme scale */}
        <div className="mb-16 md:mb-32 py-12 md:py-24 border-y border-foreground/10">
          <p className="text-3xl md:text-6xl font-light leading-tight max-w-5xl">
            Odwaga to efekt determinacji w wierze w marzenia, które są{" "}
            <span className="italic">poza zasięgiem.</span>
          </p>
        </div>

        {/* Wants section with vertical rhythm */}
        <div className="mb-16 md:mb-32">
          <div className="space-y-6 md:space-y-8">
            <p className="text-5xl md:text-7xl font-light">CHCEMY</p>
            <div className="pl-16 md:pl-32 space-y-3 md:space-y-4 text-muted-foreground">
              <p className="text-xl md:text-2xl">poczuć</p>
              <p className="text-xl md:text-2xl">dotknąć</p>
              <p className="text-xl md:text-2xl">posiadać</p>
            </div>
          </div>
        </div>

        {/* Footer with scale contrast */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-8 md:pt-16 border-t border-foreground/10">
          <div>
            <p className="text-xs tracking-wider text-muted-foreground mb-4">
              JAKIE JEST NASZE MARZENIE?
            </p>
            <p className="text-xl md:text-2xl font-light">
              Pielęgnować nasz czyn.
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-xs tracking-wider text-muted-foreground mb-4">
              CZYM JEST ACRM?
            </p>
            <p className="text-6xl md:text-8xl font-light leading-none">
              Rezultatem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
