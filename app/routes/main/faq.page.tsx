import { Link } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "Czy produkty w ACRM są nowe czy używane?",
    answer: (
      <p>
        Wszystkie produkty w naszym sklepie to{" "}
        <span className="font-bold text-primary">
          odzież używana (second-hand)
        </span>
        . Każda sztuka jest starannie wyselekcjonowana i sprawdzona pod kątem
        stanu.{" "}
        <span className="font-bold text-primary">
          Nie jesteśmy oficjalnym dystrybutorem ani przedstawicielem żadnej z
          prezentowanych marek.
        </span>
      </p>
    ),
  },
  {
    question: "Ile kosztuje dostawa?",
    answer: (
      <p>
        Dostawa jest{" "}
        <span className="font-bold text-primary">zawsze bezpłatna</span> — na
        wszystkie zamówienia, bez minimalnej kwoty. Wysyłamy za pośrednictwem{" "}
        <span className="font-bold text-primary">InPost</span> do paczkomatu lub
        kurierem pod wskazany adres na terenie Polski.
      </p>
    ),
  },
  {
    question: "Jak szybko zostanie wysłane moje zamówienie?",
    answer: (
      <p>
        Zamówienia realizujemy w ciągu{" "}
        <span className="font-bold text-primary">jednego dnia roboczego</span>{" "}
        od momentu zaksięgowania płatności. Czas dostawy InPost to dodatkowo{" "}
        <span className="font-bold text-primary">1–2 dni robocze</span>.
        Zamówienia składane w weekendy i święta są realizowane w najbliższy
        dzień roboczy.
      </p>
    ),
  },
  {
    question: "Czy mogę zwrócić zakupiony produkt?",
    answer: (
      <p>
        Tak. Masz <span className="font-bold text-primary">14 dni</span> od
        otrzymania przesyłki na odstąpienie od umowy bez podania przyczyny.
        Wystarczy złożyć wniosek o zwrot za pomocą formularza dostępnego na
        stronie{" "}
        <Link
          to="/zwroty"
          className="font-bold text-primary underline underline-offset-4"
        >
          zwroty
        </Link>{" "}
        lub e-mailem na{" "}
        <Link
          to="mailto:kontakt@acrm.pl"
          className="font-bold text-primary underline underline-offset-4"
        >
          kontakt@acrm.pl
        </Link>
        . Alternatywnie możesz{" "}
        <span className="font-bold text-primary">
          wysłać oświadczenie o odstąpieniu
        </span>{" "}
        (e-mailem lub pisemnie) i odesłać produkt na adres:{" "}
        <span className="font-bold text-primary">
          ul. Nad Sudołem 24/22, 31-228 Kraków
        </span>
        . Koszt przesyłki zwrotnej ponosi kupujący.
      </p>
    ),
  },
  {
    question: "Jak wygląda proces zwrotu pieniędzy?",
    answer: (
      <p>
        Zwrot środków następuje w ciągu{" "}
        <span className="font-bold text-primary">14 dni</span> od otrzymania
        oświadczenia o odstąpieniu, tą samą metodą płatności, której użyto przy
        zakupie. Możemy wstrzymać zwrot do momentu otrzymania towaru lub
        potwierdzenia jego nadania.
      </p>
    ),
  },
  {
    question: "Jakie metody płatności są dostępne?",
    answer: (
      <p>
        Akceptujemy{" "}
        <span className="font-bold text-primary">
          płatności kartą (Visa, Mastercard, Maestro), BLIK
        </span>{" "}
        oraz <span className="font-bold text-primary">Apple Pay</span>.
        Wszystkie transakcje są szyfrowane i przetwarzane przez Stripe —
        certyfikowanego operatora płatności.
      </p>
    ),
  },
  {
    question:
      "Czy ACRM jest oficjalnym sklepem marek takich jak Nike, Dickies czy Carhartt?",
    answer: (
      <p>
        Nie. ACRM to{" "}
        <span className="font-bold text-primary">
          niezależny sklep z odzieżą używaną
        </span>
        . Nie jesteśmy oficjalnym dystrybutorem, przedstawicielem ani partnerem
        żadnej z marek prezentowanych w ofercie. Zajmujemy się kuratorską
        odsprzedażą starannie wyselekcjonowanych ubrań z drugiej ręki.
      </p>
    ),
  },
  {
    question: "W jakim stanie są ubrania?",
    answer: (
      <p>
        Każdy produkt jest{" "}
        <span className="font-bold text-primary">
          dokładnie sprawdzany przed wystawieniem
        </span>
        . Opisujemy stan ubrania, podajemy wymiary i zamieszczamy szczegółowe
        zdjęcia. Jeśli ubranie ma jakiekolwiek wady,{" "}
        <span className="font-bold text-primary">
          informujemy o tym w opisie
        </span>
        .
      </p>
    ),
  },
  {
    question: "Jak mogę się z Wami skontaktować?",
    answer: (
      <p>
        Możesz się z nami skontaktować przez e-mail:{" "}
        <Link
          to="mailto:kontakt@acrm.pl"
          className="font-bold text-primary underline underline-offset-4"
        >
          kontakt@acrm.pl
        </Link>
        , telefonicznie:{" "}
        <Link
          to="tel:+48453450597"
          className="font-bold text-primary underline underline-offset-4"
        >
          +48 453-450-597
        </Link>{" "}
        lub przez{" "}
        <Link
          to="/zwroty"
          className="font-bold text-primary underline underline-offset-4"
        >
          formularz zwrotu
        </Link>
        . Obsługa klienta jest dostępna od{" "}
        <span className="font-bold text-primary">
          poniedziałku do piątku w godzinach 9:00–17:00
        </span>
        .
      </p>
    ),
  },
  {
    question: "Jak mogę złożyć reklamację?",
    answer: (
      <p>
        Reklamację można złożyć pisemnie na adres:{" "}
        <span className="font-bold text-primary">
          ul. Nad Sudołem 24/22, 31-228 Kraków
        </span>
        , elektronicznie przez{" "}
        <Link
          to="/zwroty"
          className="font-bold text-primary underline underline-offset-4"
        >
          formularz na stronie /zwroty
        </Link>{" "}
        lub e-mailem na{" "}
        <Link
          to="mailto:kontakt@acrm.pl"
          className="font-bold text-primary underline underline-offset-4"
        >
          kontakt@acrm.pl
        </Link>
        . Odpowiadamy na reklamacje w ciągu{" "}
        <span className="font-bold text-primary">14 dni kalendarzowych</span>.
      </p>
    ),
  },
];

export const meta = () => [
  { title: "FAQ | ACRM" },
  {
    name: "description",
    content:
      "Najczęściej zadawane pytania dotyczące zakupów w ACRM — dostawa, zwroty, płatności, stan produktów i kontakt.",
  },
  { tagName: "link", rel: "canonical", href: "https://www.acrm.pl/faq" },
];

export default function FAQPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="py-16 md:py-32 w-full">
        <div className="container">
          <div className="mt-20 flex flex-col justify-between gap-10 lg:flex-row">
            <div className="w-full max-w-md">
              <h1 className="text-5xl font-semibold tracking-tight lg:text-8xl">
                Najczęściej zadawane pytania
              </h1>
            </div>
            <Accordion
              type="single"
              collapsible
              className="flex w-full flex-col gap-2 lg:pl-44"
            >
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-base">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </main>
  );
}
