import React from "react";

import { Container, Section } from "~/components/ui/layout";

import type { Route } from "./+types/terms-of-service.page";

const APP_URL = import.meta.env.VITE_APP_URL;
const CONTACT_EMAIL = import.meta.env.VITE_COMPANY_EMAIL;
const PAGE_TITLE = "Regulamin sklepu internetowego | ACRM";
export const meta: Route.MetaFunction = () => [{ title: PAGE_TITLE }];

const RichText = React.lazy(() =>
  import("~/components/shared/rich-text/rich-text").then((mod) => ({
    default: mod.RichText,
  }))
);

export default function TermsOfServicePage() {
  return (
    <main>
      <Container>
        <Section>
          <React.Suspense fallback={null}>
            <RichText
              className="legal-text"
              content={{
                type: "doc",
                content: [
                  {
                    type: "heading",
                    attrs: { textAlign: "center", level: 1 },
                    content: [
                      { type: "text", text: "REGULAMIN SKLEPU INTERNETOWEGO " },
                      {
                        type: "text",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: APP_URL,
                              target: "_blank",
                              rel: "noopener noreferrer nofollow",
                              class: null,
                            },
                          },
                        ],
                        text: "ACRM.PL",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [{ type: "text", text: "SPIS TREŚCI:" }],
                  },
                  {
                    type: "orderedList",
                    attrs: { start: 1, type: null },
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              { type: "text", text: "POSTANOWIENIA OGÓLNE" },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                text: "USŁUGI ELEKTRONICZNE W SKLEPIE INTERNETOWYM",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                text: "WARUNKI ZAWIERANIA UMOWY SPRZEDAŻY",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                text: "SPOSOBY I TERMINY PŁATNOŚCI ZA PRODUKT",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                text: "KOSZT, SPOSOBY I TERMIN DOSTAWY PRODUKTU",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                text: "PROCEDURA ROZPATRYWANIA REKLAMACJI",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                text: "POZASĄDOWE SPOSOBY ROZPATRYWANIA REKLAMACJI I DOCHODZENIA ROSZCZEŃ ORAZ ZASADY DOSTĘPU DO TYCH PROCEDUR",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                text: "PRAWO ODSTĄPIENIA OD UMOWY",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              { type: "text", text: "OPINIE O PRODUKTACH" },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                text: "NIELEGALNE TREŚCI I INNE TREŚCI NIEZGODNE Z REGULAMINEM",
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              { type: "text", text: "POSTANOWIENIA KOŃCOWE" },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                text: "WZÓR FORMULARZA ODSTĄPIENIA OD UMOWY",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: "center" },
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }, { type: "italic" }],
                        text: "Ten Regulamin Sklepu Internetowego został przygotowany przez prawników serwisu ",
                      },
                      {
                        type: "text",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: "http://Prokonsumencki.pl",
                              target: "_blank",
                              rel: "noopener noreferrer nofollow",
                              class: null,
                            },
                          },
                          { type: "bold" },
                          { type: "italic" },
                        ],
                        text: "Prokonsumencki.pl",
                      },
                      {
                        type: "text",
                        marks: [{ type: "bold" }, { type: "italic" }],
                        text: ".",
                      },
                      {
                        type: "text",
                        marks: [{ type: "italic" }],
                        text: " Sklep Internetowy ",
                      },
                      {
                        type: "text",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: APP_URL,
                              target: "_blank",
                              rel: "noopener noreferrer nofollow",
                              class: null,
                            },
                          },
                          { type: "italic" },
                        ],
                        text: "www.acrm.pl",
                      },
                      {
                        type: "text",
                        marks: [{ type: "italic" }],
                        text: " dba o prawa konsumenta. Konsument nie może zrzec się praw przyznanych mu w Ustawie o Prawach Konsumenta. Postanowienia umów mniej korzystne dla konsumenta niż postanowienia Ustawy o Prawach Konsumenta są nieważne, a w ich miejsce stosuje się przepisy Ustawy o Prawach Konsumenta. Dlatego też postanowienia niniejszego Regulaminu nie mają na celu wyłączać ani ograniczać jakichkolwiek praw konsumentów przysługujących im na mocy bezwzględnie wiążących przepisów prawa, a wszelkie ewentualne wątpliwości należy tłumaczyć na korzyść konsumenta. W przypadku ewentualnej niezgodności postanowień niniejszego Regulaminu z powyższymi przepisami, pierwszeństwo mają te przepisy i należy je stosować.",
                      },
                    ],
                  },
                  {
                    type: "orderedList",
                    attrs: { start: 1, type: null },
                    content: [
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "POSTANOWIENIA OGÓLNE",
                              },
                            ],
                          },
                          {
                            type: "orderedList",
                            attrs: { start: 1, type: null },
                            content: [
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Sklep Internetowy dostępny pod adresem internetowym ",
                                      },
                                      {
                                        type: "text",
                                        marks: [
                                          {
                                            type: "link",
                                            attrs: {
                                              href: APP_URL,
                                              target: "_blank",
                                              rel: "noopener noreferrer nofollow",
                                              class: null,
                                            },
                                          },
                                        ],
                                        text: "www.acrm.pl",
                                      },
                                      {
                                        type: "text",
                                        text: " prowadzony jest przez ACRM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ z siedzibą w Krakowie (adres siedziby i adres do doręczeń: ul. Nad Sudołem 24/22, 31-228 Kraków); wpisaną do Rejestru Przedsiębiorców Krajowego Rejestru Sądowego pod numerem KRS: 0001193211; sąd rejestrowy, w którym przechowywana jest dokumentacja spółki: Sąd Rejonowy dla Krakowa Śródmieścia w Krakowie XI Wydział Gospodarczy Krajowego Rejestru Sądowego; kapitał zakładowy w wysokości: 5.000,00 zł; NIP: 9452316835; REGON: 542680140, adres poczty elektronicznej: ",
                                      },
                                      {
                                        type: "text",
                                        marks: [
                                          {
                                            type: "link",
                                            attrs: {
                                              href: `mailto:${CONTACT_EMAIL}`,
                                              target: "_blank",
                                              rel: "noopener noreferrer nofollow",
                                              class: null,
                                            },
                                          },
                                        ],
                                        text: `${CONTACT_EMAIL}`,
                                      },
                                      {
                                        type: "text",
                                        text: " oraz numer telefonu kontaktowego:+48 453-450-597.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Niniejszy Regulamin skierowany jest zarówno do konsumentów, jak i do przedsiębiorców korzystających ze Sklepu Internetowego, chyba że dane postanowienie Regulaminu stanowi inaczej.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Administratorem danych osobowych przetwarzanych w Sklepie Internetowym w związku z realizacją postanowień niniejszego Regulaminu jest Sprzedawca. Dane osobowe przetwarzane są w celach, przez okres i w oparciu o podstawy i zasady wskazane w polityce prywatności opublikowanej na stronie Sklepu Internetowego. Polityka prywatności zawiera przede wszystkim zasady dotyczące przetwarzania danych osobowych przez Administratora w Sklepie Internetowym, w tym podstawy, cele i okres przetwarzania danych osobowych oraz prawa osób, których dane dotyczą, a także informacje w zakresie stosowania w Sklepie Internetowym plików cookies oraz narzędzi analitycznych. Korzystanie ze Sklepu Internetowego, w tym dokonywanie zakupów jest dobrowolne. Podobnie związane z tym podanie danych osobowych przez korzystającego ze Sklepu Internetowego Usługobiorcę lub Klienta jest dobrowolne, z zastrzeżeniem wyjątków wskazanych w polityce prywatności (zawarcie umowy oraz obowiązki ustawowe Sprzedawcy).",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      { type: "text", text: "Definicje:" },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "AKT O USŁUGACH CYFROWYCH, AKT",
                                              },
                                              {
                                                type: "text",
                                                text: " – rozporządzenie Parlamentu Europejskiego i Rady (UE) 2022/2065 z dnia 19 października 2022 r. w sprawie jednolitego rynku usług cyfrowych oraz zmiany dyrektywy 2000/31/WE (akt o usługach cyfrowych) (Dz.U. L 277 z 27.10.2022, s. 1–102).",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "DZIEŃ ROBOCZY",
                                              },
                                              {
                                                type: "text",
                                                text: " – jeden dzień od poniedziałku do piątku z wyłączeniem dni ustawowo wolnych od pracy.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "FORMULARZ KONTAKTOWY",
                                              },
                                              {
                                                type: "text",
                                                text: " – Usługa Elektroniczna, interaktywny formularz dostępny w Sklepie Internetowym umożliwiający bezpośredni kontakt z Usługodawcą.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "FORMULARZ REJESTRACJI ",
                                              },
                                              {
                                                type: "text",
                                                text: "– formularz dostępny w Sklepie Internetowym umożliwiający utworzenie Konta.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "FORMULARZ ZAMÓWIENIA",
                                              },
                                              {
                                                type: "text",
                                                text: " – Usługa Elektroniczna, interaktywny formularz dostępny w Sklepie Internetowym umożliwiający złożenie Zamówienia, w szczególności poprzez dodanie Produktów do elektronicznego koszyka oraz określenie warunków Umowy Sprzedaży, w tym sposobu dostawy i płatności.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "KLIENT",
                                              },
                                              {
                                                type: "text",
                                                text: " – (1) osoba fizyczna posiadająca pełną zdolność do czynności prawnych, a w wypadkach przewidzianych przez przepisy powszechnie obowiązujące także osoba fizyczna posiadająca ograniczoną zdolność do czynności prawnych; (2) osoba prawna; albo (3) jednostka organizacyjna nieposiadająca osobowości prawnej, której ustawa przyznaje zdolność prawną – która zawarła lub zamierza zawrzeć Umowę Sprzedaży ze Sprzedawcą.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "KODEKS CYWILNY",
                                              },
                                              {
                                                type: "text",
                                                text: " – ustawa Kodeks cywilny z dnia 23 kwietnia 1964 r. (Dz.U. 1964 nr 16, poz. 93 ze zm.).",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "KONTO",
                                              },
                                              {
                                                type: "text",
                                                text: " – Usługa Elektroniczna, oznaczony indywidualną nazwą (loginem) i hasłem podanym przez Usługobiorcę zbiór zasobów w systemie teleinformatycznym Usługodawcy, w którym gromadzone są dane podane przez Usługobiorcę oraz informacje o złożonych przez niego Zamówieniach w Sklepie Internetowym.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "NEWSLETTER",
                                              },
                                              {
                                                type: "text",
                                                text: " – Usługa Elektroniczna, elektroniczna usługa dystrybucyjna świadczona przez Usługodawcę za pośrednictwem poczty elektronicznej e-mail, która umożliwia wszystkim korzystającym z niej Usługobiorcom automatyczne otrzymywanie od Usługodawcy cyklicznych treści kolejnych edycji newslettera zawierającego informacje o Produktach, nowościach i promocjach w Sklepie Internetowym.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "NIELEGALNE TREŚCI",
                                              },
                                              {
                                                type: "text",
                                                text: " – informacje, które same w sobie lub przez odniesienie do działania, w tym sprzedaży Produktów lub świadczenia Usług Elektronicznych, nie są zgodne z prawem Unii Europejskiej lub z prawem jakiegokolwiek państwa członkowskiego, które jest zgodne z prawem Unii Europejskiej, niezależnie od konkretnego przedmiotu lub charakteru tego prawa.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "PRODUKT",
                                              },
                                              {
                                                type: "text",
                                                text: " – (1) rzecz ruchoma (w tym rzecz ruchoma z elementami cyfrowymi, tj. zawierająca treść cyfrową lub usługę cyfrową lub z nimi połączona w taki sposób, że brak treści cyfrowej lub usługi cyfrowej uniemożliwiłby jej prawidłowe funkcjonowanie), (2) treść cyfrowa, (3) usługa (w tym usługa cyfrowa i inna niż cyfrowa) lub (4) prawo będące przedmiotem Umowy Sprzedaży między Klientem a Sprzedawcą.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "REGULAMIN",
                                              },
                                              {
                                                type: "text",
                                                text: " – niniejszy regulamin Sklepu Internetowego.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "SKLEP INTERNETOWY",
                                              },
                                              {
                                                type: "text",
                                                text: " – sklep internetowy Usługodawcy dostępny pod adresem internetowym: ",
                                              },
                                              {
                                                type: "text",
                                                marks: [
                                                  {
                                                    type: "link",
                                                    attrs: {
                                                      href: APP_URL,
                                                      target: "_blank",
                                                      rel: "noopener noreferrer nofollow",
                                                      class: null,
                                                    },
                                                  },
                                                ],
                                                text: "www.acrm.pl",
                                              },
                                              { type: "text", text: "." },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              { type: "text", text: "S" },
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "PRZEDAWCA; USŁUGODAWCA",
                                              },
                                              {
                                                type: "text",
                                                text: " – ACRM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ z siedzibą w Krakowie (adres siedziby i adres do doręczeń: ul. Nad Sudołem 24/22, 31-228 Kraków); wpisana do Rejestru Przedsiębiorców Krajowego Rejestru Sądowego pod numerem KRS: 0001193211; sąd rejestrowy, w którym przechowywana jest dokumentacja spółki: Sąd Rejonowy dla Krakowa Śródmieścia w Krakowie XI Wydział Gospodarczy Krajowego Rejestru Sądowego; kapitał zakładowy w wysokości: 5.000,00 zł; NIP: 9452316835; REGON: 542680140, adres poczty elektronicznej: ",
                                              },
                                              {
                                                type: "text",
                                                marks: [
                                                  {
                                                    type: "link",
                                                    attrs: {
                                                      href: `mailto:${CONTACT_EMAIL}`,
                                                      target: "_blank",
                                                      rel: "noopener noreferrer nofollow",
                                                      class: null,
                                                    },
                                                  },
                                                ],
                                                text: `${CONTACT_EMAIL}`,
                                              },
                                              {
                                                type: "text",
                                                text: " oraz numer telefonu kontaktowego: +48 453-450-597.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "UMOWA SPRZEDAŻY",
                                              },
                                              {
                                                type: "text",
                                                text: " – (1) umowa sprzedaży Produktu (w przypadku rzeczy ruchomych oraz rzeczy ruchomych z elementami cyfrowymi), (2) umowa o dostarczanie Produktu (w przypadku treści cyfrowej lub usługi cyfrowej), (3) umowa o świadczenie lub korzystanie z Produktu (w przypadku usługi innej niż cyfrowa oraz pozostałych Produktów) zawierana albo zawarta między Klientem a Sprzedawcą za pośrednictwem Sklepu Internetowego.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "USŁUGA ELEKTRONICZNA",
                                              },
                                              {
                                                type: "text",
                                                text: " – usługa świadczona drogą elektroniczną przez Usługodawcę na rzecz Usługobiorcy za pośrednictwem Sklepu Internetowego i niebędąca Produktem.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "USŁUGOBIORCA",
                                              },
                                              {
                                                type: "text",
                                                text: " – (1) osoba fizyczna posiadająca pełną zdolność do czynności prawnych, a w wypadkach przewidzianych przez przepisy powszechnie obowiązujące także osoba fizyczna posiadająca ograniczoną zdolność do czynności prawnych; (2) osoba prawna; albo (3) jednostka organizacyjna nieposiadająca osobowości prawnej, której ustawa przyznaje zdolność prawną –korzystająca lub zamierzająca korzystać z Usługi Elektronicznej.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "USTAWA O PRAWACH KONSUMENTA",
                                              },
                                              {
                                                type: "text",
                                                text: " – ustawa z dnia 30 maja 2014 r. o prawach konsumenta (Dz.U. 2014 poz. 827 ze zm.)",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "ZAMÓWIENIE",
                                              },
                                              {
                                                type: "text",
                                                text: " – oświadczenie woli Klienta składane za pomocą Formularza Zamówienia i zmierzające bezpośrednio do zawarcia Umowy Sprzedaży Produktu ze Sprzedawcą.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "USŁUGI ELEKTRONICZNE W SKLEPIE INTERNETOWYM",
                              },
                            ],
                          },
                          {
                            type: "orderedList",
                            attrs: { start: 1, type: null },
                            content: [
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "W Sklepie Internetowym dostępne są następujące Usługi Elektroniczne: Formularz Kontaktowy, Formularz Zamówienia, Konto oraz Newsletter.",
                                      },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "Formularz Kontaktowy",
                                              },
                                              {
                                                type: "text",
                                                text: " – korzystanie z Formularza Kontaktowego rozpoczyna się po wykonaniu przez Usługobiorcę łącznie dwóch kolejnych kroków – (1) przejścia do zakładki „Kontakt” i (2) kliknięciu na stronie Sklepu Internetowego po wypełnieniu Formularza Kontaktowego pole „",
                                              },
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "Wyślij",
                                              },
                                              {
                                                type: "text",
                                                text: "”. W Formularzu Kontaktowym niezbędne jest podanie przez Usługobiorcę następujących danych: imię i nazwisko, adres poczty elektronicznej oraz wpisanie treści zapytania. W celu sprawniejszej obsługi, Usługobiorca może również podać następujące dane: imię i nazwisko, numer telefonu kontaktowego oraz treść zapytania.",
                                              },
                                            ],
                                          },
                                          {
                                            type: "orderedList",
                                            attrs: { start: 1, type: null },
                                            content: [
                                              {
                                                type: "listItem",
                                                content: [
                                                  {
                                                    type: "paragraph",
                                                    attrs: { textAlign: null },
                                                    content: [
                                                      {
                                                        type: "text",
                                                        text: "Usługa Elektroniczna Formularz Kontaktowy świadczona jest nieodpłatnie oraz ma charakter jednorazowy i ulega zakończeniu z chwilą wysłania wiadomości za jego pośrednictwem albo z chwilą wcześniejszego zaprzestania korzystania z niego przez Usługobiorcę.",
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "Formularz Zamówienia",
                                              },
                                              {
                                                type: "text",
                                                text: " – korzystanie z Formularza Zamówienia rozpoczyna się z momentem dodania przez Klienta pierwszego Produktu do elektronicznego koszyka w Sklepie Internetowym. Złożenie Zamówienia następuje po wykonaniu przez Klienta łącznie dwóch kolejnych kroków – (1) po wypełnieniu Formularza Zamówienia i (2) kliknięciu na stronie Sklepu Internetowego po wypełnieniu Formularza Zamówienia pola „",
                                              },
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "Kupuję i płace",
                                              },
                                              {
                                                type: "text",
                                                text: "” – do tego momentu istnieje możliwość samodzielnej modyfikacji wprowadzanych danych (w tym celu należy kierować się wyświetlanymi komunikatami oraz informacjami dostępnymi na stronie Sklepu Internetowego). W Formularzu Zamówienia niezbędne jest podanie przez Klienta następujących danych dotyczących Klienta: imię i nazwisko/nazwa firmy, adres (ulica, numer domu/mieszkania, kod pocztowy, miejscowość, kraj), adres poczty elektronicznej, numer telefonu kontaktowego oraz danych dotyczących Umowy Sprzedaży: Produkt/y, ilość Produktu/ów, miejsce i sposób dostawy Produktu/ów, sposób płatności. W wypadku Klientów niebędących konsumentami niezbędne jest także podanie nazwy firmy oraz numeru NIP.",
                                              },
                                            ],
                                          },
                                          {
                                            type: "orderedList",
                                            attrs: { start: 1, type: null },
                                            content: [
                                              {
                                                type: "listItem",
                                                content: [
                                                  {
                                                    type: "paragraph",
                                                    attrs: { textAlign: null },
                                                    content: [
                                                      {
                                                        type: "text",
                                                        text: "Usługa Elektroniczna Formularz Zamówienia świadczona jest nieodpłatnie oraz ma charakter jednorazowy i ulega zakończeniu z chwilą złożenia Zamówienia za jego pośrednictwem albo z chwilą wcześniejszego zaprzestania składania Zamówienia za jego pośrednictwem przez Usługobiorcę.",
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "Konto",
                                              },
                                              {
                                                type: "text",
                                                text: " – korzystanie z Konta możliwe jest po wykonaniu łącznie dwóch kolejnych kroków przez Usługobiorcę – (1) wypełnieniu Formularza Rejestracji, (2) kliknięciu pola „",
                                              },
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "Zarejestruj się",
                                              },
                                              {
                                                type: "text",
                                                text: "”. W Formularzu Rejestracji niezbędne jest podanie przez Usługobiorcę następujących danych Usługobiorcy: imię, nazwisko, adres poczty elektronicznej oraz hasło.",
                                              },
                                            ],
                                          },
                                          {
                                            type: "orderedList",
                                            attrs: { start: 1, type: null },
                                            content: [
                                              {
                                                type: "listItem",
                                                content: [
                                                  {
                                                    type: "paragraph",
                                                    attrs: { textAlign: null },
                                                    content: [
                                                      {
                                                        type: "text",
                                                        text: "Usługa Elektroniczna Konto świadczona jest nieodpłatnie przez czas nieoznaczony. Usługobiorca ma możliwość, w każdej chwili i bez podania przyczyny, usunięcia Konta (rezygnacji z Konta) poprzez wysłanie stosownego żądania do Usługodawcy, w szczególności za pośrednictwem poczty elektronicznej na adres: ",
                                                      },
                                                      {
                                                        type: "text",
                                                        marks: [
                                                          {
                                                            type: "link",
                                                            attrs: {
                                                              href: `mailto:${CONTACT_EMAIL}`,
                                                              target: "_blank",
                                                              rel: "noopener noreferrer nofollow",
                                                              class: null,
                                                            },
                                                          },
                                                        ],
                                                        text: `${CONTACT_EMAIL}`,
                                                      },
                                                      {
                                                        type: "text",
                                                        text: " lub też pisemnie na adres: ul. Nad Sudołem 24/22, 31-228 Kraków.",
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "Newsletter",
                                              },
                                              {
                                                type: "text",
                                                text: " – korzystanie z Newslettera możliwe jest poprzez zaznaczenie odpowiedniego checkboxa w ustawieniach Konta – z chwilą kliknięcia pola „Zapisz” Usługobiorca zostaje zapisany na Newsletter.",
                                              },
                                            ],
                                          },
                                          {
                                            type: "orderedList",
                                            attrs: { start: 1, type: null },
                                            content: [
                                              {
                                                type: "listItem",
                                                content: [
                                                  {
                                                    type: "paragraph",
                                                    attrs: { textAlign: null },
                                                    content: [
                                                      {
                                                        type: "text",
                                                        text: "Usługa Elektroniczna Newsletter świadczona jest nieodpłatnie przez czas nieoznaczony. Usługobiorca ma możliwość, w każdej chwili i bez podania przyczyny, wypisania się z Newslettera (rezygnacji z Newslettera) poprzez wysłanie stosownego żądania do Usługodawcy, w szczególności za pośrednictwem poczty elektronicznej na adres: ",
                                                      },
                                                      {
                                                        type: "text",
                                                        marks: [
                                                          {
                                                            type: "link",
                                                            attrs: {
                                                              href: `mailto:${CONTACT_EMAIL}`,
                                                              target: "_blank",
                                                              rel: "noopener noreferrer nofollow",
                                                              class: null,
                                                            },
                                                          },
                                                        ],
                                                        text: `${CONTACT_EMAIL}`,
                                                      },
                                                      {
                                                        type: "text",
                                                        text: " lub też pisemnie na adres: ul. Nad Sudołem 24/22, 31-228 Kraków. (2) zaznaczenie odpowiedniego checkboxa w ustawieniach Konta – z chwilą kliknięcia pola „Zapisz” Usługobiorca zostaje wypisany z Newslettera.",
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Wymagania techniczne niezbędne do współpracy z systemem teleinformatycznym, którym posługuje się Usługodawca: (1) komputer, laptop lub inne urządzenie multimedialne z dostępem do Internetu; (2) dostęp do poczty elektronicznej; (3) przeglądarka internetowa w aktualnej wersji: Mozilla Firefox; Opera; Google Chrome; Safari; Microsoft Edge; (4) włączenie w przeglądarce internetowej możliwości zapisu plików Cookies oraz obsługi Javascript.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Usługobiorca obowiązany jest do korzystania ze Sklepu Internetowego w sposób zgodny z prawem i dobrymi obyczajami mając na uwadze poszanowanie dóbr osobistych oraz praw autorskich i własności intelektualnej Usługodawcy oraz osób trzecich. Usługobiorca obowiązany jest do wprowadzania danych zgodnych ze stanem faktycznym. Usługobiorcę obowiązuje zakaz dostarczania treści o charakterze bezprawnym, w tym Nielegalnych Treści.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Tryb postępowania reklamacyjnego dotyczący Usług Elektronicznych wskazany jest w punkcie 6. Regulaminu.",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "WARUNKI ZAWIERANIA UMOWY SPRZEDAŻY",
                              },
                            ],
                          },
                          {
                            type: "orderedList",
                            attrs: { start: 1, type: null },
                            content: [
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Zawarcie Umowy Sprzedaży między Klientem a Sprzedawcą następuje po uprzednim złożeniu przez Klienta Zamówienia za pomocą Formularza Zamówień w Sklepie Internetowym zgodnie z punktem 2.1.3. Regulaminu.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "W przypadku Produktów opisanych jako używane bądź niepełnowartościowe, Sprzedawca nie ponosi odpowiedzialności za brak zgodności Produktu z umową w zakresie, ilości, trwałości, bezpieczeństwa, opakowania, akcesoriów i instrukcji, jakich Klient będący konsumentem mógłby rozsądnie oczekiwać, jeżeli Klient będący konsumentem, najpóźniej w chwili zawarcia umowy, został wyraźnie poinformowany, że konkretna cecha Produktu odbiega od wskazanych wyżej wymogów zgodności z umową oraz wyraźnie i odrębnie zaakceptował brak konkretnej cechy Produktu.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Cena Produktu lub wynagrodzenie za produkt uwidoczniona na stronie Sklepu Internetowego podane jest w złotych polskich i zawiera podatki. O łącznej cenie lub wynagrodzeniu wraz z podatkami, a gdy charakter Produktu nie pozwala, rozsądnie oceniając, na wcześniejsze obliczenie wysokości – sposobie, w jaki będą one obliczane, a także o kosztach dostawy (w tym opłatach za transport, dostarczenie lub usługi pocztowe) oraz o innych kosztach, a gdy nie można ustalić wysokości tych opłat – o obowiązku ich uiszczenia, Klient jest informowany na stronach Sklepu Internetowego, w tym także w trakcie składania Zamówienia oraz w chwili wyrażenia przez Klienta woli związania się Umową Sprzedaży. W razie Umowy Sprzedaży Produktu zawieranej na czas nieoznaczony lub obejmującej prenumeratę Sprzedawca podaje w ten sam sposób łączną cenę lub wynagrodzenie obejmujące wszystkie płatności za okres rozliczeniowy, a gdy Umowa Sprzedaży przewiduje stałą stawkę - także łączne miesięczne płatności.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        marks: [{ type: "bold" }],
                                        text: "Procedura zawarcia Umowy Sprzedaży w Sklepie Internetowym za pomocą Formularza Zamówienia",
                                      },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Zawarcie Umowy Sprzedaży między Klientem a Sprzedawcą następuje po uprzednim złożeniu przez Klienta Zamówienia w Sklepie Internetowym zgodnie z punktem 2.1.3. Regulaminu.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Po złożeniu Zamówienia Sprzedawca niezwłocznie potwierdza jego otrzymanie oraz jednocześnie przyjmuje Zamówienie do realizacji. Potwierdzenie otrzymania Zamówienia i jego przyjęcie do realizacji następuje poprzez przesłanie przez Sprzedawcę Klientowi stosownej wiadomości e-mail na podany w trakcie składania Zamówienia adres poczty elektronicznej Klienta, która zawiera co najmniej oświadczenia Sprzedawcy o otrzymaniu Zamówienia i o jego przyjęciu do realizacji oraz potwierdzenie zawarcia Umowy Sprzedaży. Z chwilą otrzymania przez Klienta powyższej wiadomości e-mail zostaje zawarta Umowa Sprzedaży między Klientem a Sprzedawcą.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Utrwalenie, zabezpieczenie oraz udostępnienie Klientowi treści zawieranej Umowy Sprzedaży następuje poprzez (1) udostępnienie niniejszego Regulaminu na stronie Sklepu Internetowego oraz (2) przesłanie Klientowi wiadomości e-mail, o której mowa w punkcie 3.4.2. Regulaminu. Treść Umowy Sprzedaży jest dodatkowo utrwalona i zabezpieczona w systemie informatycznym Sklepu Internetowego Sprzedawcy.",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "SPOSOBY I TERMINY PŁATNOŚCI ZA PRODUKT",
                              },
                            ],
                          },
                          {
                            type: "orderedList",
                            attrs: { start: 1, type: null },
                            content: [
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Sprzedawca udostępnia Klientowi następujące sposoby płatności z tytułu Umowy Sprzedaży:",
                                      },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Płatności elektroniczne i płatności kartą płatniczą za pośrednictwem serwisu Stripe.com – możliwe aktualne sposoby płatności określone są na stronie Sklepu Internetowego w zakładce informacyjnej dotyczącej sposobów płatności oraz na stronie internetowej https://stripe.com/en-pl.",
                                              },
                                            ],
                                          },
                                          {
                                            type: "orderedList",
                                            attrs: { start: 1, type: null },
                                            content: [
                                              {
                                                type: "listItem",
                                                content: [
                                                  {
                                                    type: "paragraph",
                                                    attrs: { textAlign: null },
                                                    content: [
                                                      {
                                                        type: "text",
                                                        text: "Rozliczenia transakcji płatnościami elektronicznymi i kartą płatniczą przeprowadzane są zgodnie z wyborem Klienta. Obsługę płatności elektronicznych i kartą płatniczą prowadzi:",
                                                      },
                                                    ],
                                                  },
                                                  {
                                                    type: "orderedList",
                                                    attrs: {
                                                      start: 1,
                                                      type: null,
                                                    },
                                                    content: [
                                                      {
                                                        type: "listItem",
                                                        content: [
                                                          {
                                                            type: "paragraph",
                                                            attrs: {
                                                              textAlign: null,
                                                            },
                                                            content: [
                                                              {
                                                                type: "text",
                                                                text: "Stripe.com - spółka Stripe Payments Europe, Ltd. (1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irlandia).",
                                                              },
                                                            ],
                                                          },
                                                        ],
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Termin płatności wynosi 1 dnia kalendarzowego od dnia zawarcia Umowy Sprzedaży.",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "KOSZT, SPOSOBY I TERMIN DOSTAWY PRODUKTU",
                              },
                            ],
                          },
                          {
                            type: "orderedList",
                            attrs: { start: 1, type: null },
                            content: [
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Dostawa Produktu dostępna jest na terytorium Rzeczypospolitej Polskiej.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Dostawa Produktu do Klienta jest odpłatna, chyba że Umowa Sprzedaży stanowi inaczej. Koszty dostawy Produktu (w tym opłaty za transport, dostarczenie i usługi pocztowe) są wskazywane Klientowi na stronach Sklepu Internetowego w zakładce informacyjnej dotyczącej kosztów dostawy oraz w trakcie składania Zamówienia, w tym także w chwili wyrażenia przez Klienta woli związania się Umową Sprzedaży.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Sprzedawca udostępnia Klientowi następujące sposoby dostawy Produktu:",
                                      },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Przesyłka kurierska.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Przesyłka paczkomatowa (odbiór w punkcie).",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        marks: [{ type: "bold" }],
                                        text: "Termin dostawy Produktu do Klienta",
                                      },
                                      {
                                        type: "text",
                                        text: " wynosi do 3 Dni Roboczych, chyba że w opisie danego Produktu lub w trakcie składania Zamówienia podano krótszy termin. W przypadku Produktów o różnych terminach dostawy, terminem dostawy jest najdłuższy podany termin, który jednak nie może przekroczyć 3 Dni Roboczych. Początek biegu terminu dostawy Produktu do Klienta liczy się od dnia uznania rachunku bankowego lub rachunku rozliczeniowego Sprzedawcy.",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "PROCEDURA ROZPATRYWANIA REKLAMACJI",
                              },
                            ],
                          },
                          {
                            type: "orderedList",
                            attrs: { start: 1, type: null },
                            content: [
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Niniejszy punkt 6. Regulaminu określa procedurę rozpatrywania reklamacji ",
                                      },
                                      {
                                        type: "text",
                                        marks: [{ type: "bold" }],
                                        text: "wspólną dla wszystkich reklamacji",
                                      },
                                      {
                                        type: "text",
                                        text: " składanych do Sprzedawcy, w szczególności reklamacji dotyczących Produktów, Umów Sprzedaży, Usług Elektronicznych oraz pozostałych reklamacji związanych z działaniem Sprzedawcy lub Sklepu Internetowego.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        marks: [{ type: "bold" }],
                                        text: "Reklamacja może zostać złożona na przykład",
                                      },
                                      { type: "text", text: ":" },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "pisemnie na adres: ul. Nad Sudołem 24/22, 31-228 Kraków;",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "w formie elektronicznej za pośrednictwem formularza udostępnionego pod adresem: www.acrm.pl/zwroty;",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "w formie elektronicznej za pośrednictwem poczty elektronicznej na adres: ",
                                              },
                                              {
                                                type: "text",
                                                marks: [
                                                  {
                                                    type: "link",
                                                    attrs: {
                                                      href: `mailto:${CONTACT_EMAIL}`,
                                                      target: "_blank",
                                                      rel: "noopener noreferrer nofollow",
                                                      class: null,
                                                    },
                                                  },
                                                ],
                                                text: `${CONTACT_EMAIL}`,
                                              },
                                              { type: "text", text: "." },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Przesłanie lub zwrot Produktu w ramach reklamacji może nastąpić na adres: ul. Nad Sudołem 24/22, 31-228 Kraków.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Zaleca się podanie w opisie reklamacji: (1) informacji i okoliczności dotyczących przedmiotu reklamacji, w szczególności rodzaju i daty wystąpienia nieprawidłowości lub braku zgodności z umową; (2) żądania sposobu doprowadzenia do zgodności z umową lub oświadczenia o obniżeniu ceny albo odstąpieniu od umowy lub innego roszczenia; oraz (3) danych kontaktowych składającego reklamację – ułatwi to i przyspieszy rozpatrzenie reklamacji. Wymogi podane w zdaniu poprzednim mają formę jedynie zalecenia i nie wpływają na skuteczność reklamacji złożonych z pominięciem zalecanego opisu reklamacji.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "W razie zmiany podanych danych kontaktowych przez składającego reklamację w trakcie rozpatrywania reklamacji zobowiązany jest on do powiadomienia o tym Sprzedawcy.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Do reklamacji mogą zostać załączone przez składającego reklamację dowody (np. zdjęcia, dokumenty lub Produkt) związane z przedmiotem reklamacji. Sprzedawca może także zwrócić się do składającego reklamację z prośbą o podanie dodatkowych informacji lub przesłanie dowodów (np. zdjęcia), jeżeli ułatwi to i przyspieszy rozpatrzenie reklamacji przez Sprzedawcę.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Sprzedawca ustosunkuje się do reklamacji niezwłocznie, nie później niż w terminie 14 dni kalendarzowych od dnia jej otrzymania.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Podstawa i zakres odpowiedzialności ustawowej Sprzedawcy są określone powszechnie obowiązującymi przepisami prawa, w szczególności w Kodeksie Cywilnym, Ustawie o Prawach Konsumenta oraz ustawie o świadczeniu usług drogą elektroniczną z dnia 18 lipca 2002 r. (Dz.U. Nr 144, poz. 1204 ze zm.). Poniżej wskazane są dodatkowe informacje dotyczące przewidzianej przez prawo odpowiedzialności Sprzedawcy za zgodność Produktu z Umową Sprzedaży:",
                                      },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "W przypadku reklamacji ",
                                              },
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "Produktu – rzeczy ruchomej (w tym rzeczy ruchomej z elementami cyfrowymi)",
                                              },
                                              {
                                                type: "text",
                                                text: ", z wyłączeniem jednak rzeczy ruchomej, która służy wyłącznie jako nośnik treści cyfrowej – zakupionego przez Klienta na podstawie Umowy Sprzedaży zawartej ze Sprzedawcą ",
                                              },
                                              {
                                                type: "text",
                                                marks: [{ type: "bold" }],
                                                text: "od dnia 1. stycznia 2023 r",
                                              },
                                              {
                                                type: "text",
                                                text: ". określają przepisy Ustawy o Prawach Konsumenta w brzmieniu obowiązującym od dnia 1. stycznia 2023 r., w szczególności art. 43a - 43g Ustawy o Prawach Konsumenta. Przepisy te określają w szczególności podstawę i zakres odpowiedzialności Sprzedawcy względem konsumenta, w razie braku zgodności Produktu z Umową Sprzedaży.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Poza odpowiedzialnością ustawową na Produkt może zostać udzielona gwarancja – jest to odpowiedzialność umowna (dodatkowa) i można z niej skorzystać, gdy dany Produkt jest objęty gwarancją. Gwarancja może być udzielona przez inny podmiot niż Sprzedawca (np. przez producenta lub dystrybutora). Szczegółowe warunki dotyczące odpowiedzialności na podstawie gwarancji, w tym także dane podmiotu odpowiedzialnego za realizację gwarancji oraz podmiotu uprawnionego do skorzystania z niej są dostępne w opisie gwarancji, np. w karcie gwarancyjnej lub w innym miejscu dotyczącym udzielenia gwarancji. Sprzedawca wskazuje, że w przypadku braku zgodności Produktu z umową Klientowi z mocy prawa przysługują środki ochrony prawnej ze strony i na koszt Sprzedawcy oraz że gwarancja nie ma wpływu na te środki ochrony prawnej.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Zawarte w punkcie 6.8.1. Regulaminu postanowienia dotyczące konsumenta stosuje się również do Klienta będącego osobą fizyczną zawierającą umowę bezpośrednio związaną z jej działalnością gospodarczą, gdy z treści tej umowy wynika, że nie posiada ona dla tej osoby charakteru zawodowego, wynikającego w szczególności z przedmiotu wykonywanej przez nią działalności gospodarczej, udostępnionego na podstawie przepisów o Centralnej Ewidencji i Informacji o Działalności Gospodarczej.",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "POZASĄDOWE SPOSOBY ROZPATRYWANIA REKLAMACJI I DOCHODZENIA ROSZCZEŃ ORAZ ZASADY DOSTĘPU DO TYCH PROCEDUR",
                              },
                            ],
                          },
                          {
                            type: "orderedList",
                            attrs: { start: 1, type: null },
                            content: [
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Metody rozwiązywania sporów bez udziału sądu to między innymi (1) umożliwienie zbliżenia stanowisk stron, np. poprzez mediację; (2) zaproponowanie rozwiązania sporu, np. poprzez koncyliację oraz (3) rozstrzygnięcie sporu i narzucenie stronom jego rozwiązania, np. w ramach arbitrażu (sąd polubowny). Szczegółowe informacje dotyczące możliwości skorzystania przez Klienta będącego konsumentem z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń, zasady dostępu do tych procedur oraz przyjazna wyszukiwarka podmiotów zajmujących się polubownym rozwiązywaniem sporów dostępne są na stronie internetowej Urzędu Ochrony Konkurencji i Konsumentów pod adresem: ",
                                      },
                                      {
                                        type: "text",
                                        marks: [
                                          {
                                            type: "link",
                                            attrs: {
                                              href: "https://polubowne.uokik.gov.pl/",
                                              target: "_blank",
                                              rel: "noopener noreferrer nofollow",
                                              class: null,
                                            },
                                          },
                                        ],
                                        text: "https://polubowne.uokik.gov.pl/",
                                      },
                                      { type: "text", text: "." },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Przy Prezesie Urzędu Ochrony Konkurencji i Konsumentów działa punkt kontaktowy, którego zadaniem jest między innymi udzielanie konsumentom informacji dotyczących pozasądowego rozwiązywania sporów konsumenckich. Z punktem konsument może się skontaktować: (1) telefonicznie – dzwoniąc pod numer 22 55 60 332 lub 22 55 60 333; (2) za pomocą poczty elektronicznej – przesyłając wiadomość na adres: kontakt.adr@uokik.gov.pl lub (3) pisemnie lub osobiście – w Centrali Urzędu przy placu Powstańców Warszawy 1 w Warszawie (00-030).",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Konsument posiada następujące przykładowe możliwości skorzystania z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń: (1) wniosek o rozstrzygnięcie sporu do stałego polubownego sądu konsumenckiego; (2) wniosek w sprawie pozasądowego rozwiązania sporu do wojewódzkiego inspektora Inspekcji; lub (3) pomoc powiatowego (miejskiego) rzecznika konsumentów lub organizacji społecznej, do której zadań statutowych należy ochrona konsumentów (m. in. Federacja Konsumentów, Stowarzyszenie Konsumentów Polskich). Porady udzielane są między innymi mailowo pod adresem porady@dlakonsumentow.pl oraz pod numerem infolinii konsumenckiej 801 440 220 (infolinia czynna w Dni Robocze, w godzinach 8:00-18:00, opłata za połączenie wg taryfy operatora).",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "PRAWO ODSTĄPIENIA OD UMOWY",
                              },
                            ],
                          },
                          {
                            type: "orderedList",
                            attrs: { start: 1, type: null },
                            content: [
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Konsument, który zawarł umowę na odległość, może w terminie 14 dni kalendarzowych odstąpić od niej bez podawania przyczyny i bez ponoszenia kosztów, z wyjątkiem kosztów określonych w punkcie 8.7. Regulaminu. Do zachowania terminu wystarczy wysłanie oświadczenia przed jego upływem. Oświadczenie o odstąpieniu od umowy może zostać złożone na przykład:",
                                      },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "pisemnie na adres: ul. Nad Sudołem 24/22, 31-228 Kraków;",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "w formie elektronicznej za pośrednictwem formularza udostępnionego pod adresem: www.acrm.pl/zwroty;",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "w formie elektronicznej za pośrednictwem poczty elektronicznej na adres: ",
                                              },
                                              {
                                                type: "text",
                                                marks: [
                                                  {
                                                    type: "link",
                                                    attrs: {
                                                      href: `mailto:${CONTACT_EMAIL}`,
                                                      target: "_blank",
                                                      rel: "noopener noreferrer nofollow",
                                                      class: null,
                                                    },
                                                  },
                                                ],
                                                text: `${CONTACT_EMAIL}`,
                                              },
                                              { type: "text", text: "." },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Zwrot Produktu - rzeczy ruchomych (w tym rzeczy ruchomych z elementami cyfrowymi) w ramach odstąpienia od umowy może nastąpić na adres: ul. Nad Sudołem 24/22, 31-228 Kraków.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Przykładowy wzór formularza odstąpienia od umowy zawarty jest w załączniku nr 2 do Ustawy o Prawach Konsumenta oraz dodatkowo dostępny jest w punkcie 12. Regulaminu. Konsument może skorzystać ze wzoru formularza, jednak nie jest to obowiązkowe.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Bieg terminu do odstąpienia od umowy rozpoczyna się:",
                                      },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "dla umowy, w wykonaniu której Sprzedawca wydaje Produkt, będąc zobowiązany do przeniesienia jego własności – od objęcia Produktu w posiadanie przez konsumenta lub wskazaną przez niego osobę trzecią inną niż przewoźnik, a w przypadku umowy, która: (1) obejmuje wiele Produktów, które są dostarczane osobno, partiami lub w częściach – od objęcia w posiadanie ostatniego Produktu, partii lub części albo (2) polega na regularnym dostarczaniu Produktów przez czas oznaczony – od objęcia w posiadanie pierwszego z Produktów;",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "dla pozostałych umów – od dnia zawarcia umowy.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "W przypadku odstąpienia od umowy zawartej na odległość umowę uważa się za niezawartą.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        marks: [{ type: "bold" }],
                                        text: "Produkty - rzeczy ruchome, w tym rzeczy ruchome z elementami cyfrowymi:",
                                      },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Sprzedawca ma obowiązek niezwłocznie, nie później niż w terminie 14 dni kalendarzowych od dnia otrzymania oświadczenia konsumenta o odstąpieniu od umowy, zwrócić konsumentowi wszystkie dokonane przez niego płatności, w tym koszty dostarczenia Produktu - rzeczy ruchomej, w tym rzeczy ruchomej z elementami cyfrowymi (z wyjątkiem dodatkowych kosztów wynikających z wybranego przez konsumenta sposobu dostarczenia innego niż najtańszy zwykły sposób dostawy dostępny w Sklepie Internetowym). Sprzedawca dokonuje zwrotu płatności przy użyciu takiego samego sposobu płatności, jakiego użył konsument, chyba że konsument wyraźnie zgodził się na inny sposób zwrotu, który nie wiąże się dla niego z żadnymi kosztami. W przypadku Produktów - rzeczy ruchomych (w tym rzeczy ruchomych z elementami cyfrowymi) - jeżeli Sprzedawca nie zaproponował, że sam odbierze Produkt od konsumenta, może wstrzymać się ze zwrotem płatności otrzymanych od konsumenta do chwili otrzymania Produktu z powrotem lub dostarczenia przez konsumenta dowodu jego odesłania, w zależności od tego, które zdarzenie nastąpi wcześniej.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "W przypadku Produktów - rzeczy ruchomych (w tym rzeczy ruchomych z elementami cyfrowymi) - konsument ma obowiązek niezwłocznie, nie później niż w terminie 14 dni kalendarzowych od dnia, w którym odstąpił od umowy, zwrócić Produkt Sprzedawcy lub przekazać go osobie upoważnionej przez Sprzedawcę do odbioru, chyba że Sprzedawca zaproponował, że sam odbierze Produkt. Do zachowania terminu wystarczy odesłanie Produktu przed jego upływem.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Konsument ponosi odpowiedzialność za zmniejszenie wartości Produktu - rzeczy ruchomej (w tym rzeczy ruchomej z elementami cyfrowymi) - będące wynikiem korzystania z niego w sposób wykraczający poza konieczny do stwierdzenia charakteru, cech i funkcjonowania Produktu.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Możliwe koszty związane z odstąpieniem przez konsumenta od umowy, które obowiązany jest ponieść konsument:",
                                      },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "W przypadku Produktów - rzeczy ruchomych (w tym rzeczy ruchomych z elementami cyfrowymi) - jeżeli konsument wybrał sposób dostawy Produktu inny niż najtańszy zwykły sposób dostawy dostępny w Sklepie Internetowym, Sprzedawca nie jest zobowiązany do zwrotu konsumentowi poniesionych przez niego dodatkowych kosztów.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "W przypadku Produktów - rzeczy ruchomych (w tym rzeczy ruchomych z elementami cyfrowymi) - konsument ponosi bezpośrednie koszty zwrotu Produktu.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "W przypadku Produktu - usługi, której wykonywanie – na wyraźne żądanie konsumenta – rozpoczęło się przed upływem terminu do odstąpienia od umowy, konsument, który wykonuje prawo odstąpienia od umowy po zgłoszeniu takiego żądania, ma obowiązek zapłaty za świadczenia spełnione do chwili odstąpienia od umowy. Kwotę zapłaty oblicza się proporcjonalnie do zakresu spełnionego świadczenia, z uwzględnieniem uzgodnionej w umowie ceny lub wynagrodzenia. Jeżeli cena lub wynagrodzenie są nadmierne, podstawą obliczenia tej kwoty jest wartość rynkowa spełnionego świadczenia.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Prawo odstąpienia od umowy zawartej na odległość nie przysługuje konsumentowi w odniesieniu do umów:",
                                      },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "(1) o świadczenie usług, za które konsument jest zobowiązany do zapłaty ceny, jeżeli Sprzedawca wykonał w pełni usługę za wyraźną i uprzednią zgodą konsumenta, który został poinformowany przed rozpoczęciem świadczenia, że po spełnieniu świadczenia przez Sprzedawcę utraci prawo odstąpienia od umowy, i przyjął to do wiadomości; (2) w której cena lub wynagrodzenie zależy od wahań na rynku finansowym, nad którymi Sprzedawca nie sprawuje kontroli, i które mogą wystąpić przed upływem terminu do odstąpienia od umowy; (3) w której przedmiotem świadczenia jest Produkt - rzecz ruchoma (w tym rzecz ruchoma z elementami cyfrowymi) - nieprefabrykowany, wyprodukowany według specyfikacji konsumenta lub służący zaspokojeniu jego zindywidualizowanych potrzeb; (4) w której przedmiotem świadczenia jest Produkt - rzecz ruchoma (w tym rzecz ruchoma z elementami cyfrowymi) - ulegający szybkiemu zepsuciu lub mająca krótki termin przydatności do użycia; (5) w której przedmiotem świadczenia jest Produkt - rzecz ruchoma (w tym rzecz ruchoma z elementami cyfrowymi) - dostarczany w zapieczętowanym opakowaniu, którego po otwarciu opakowania nie można zwrócić ze względu na ochronę zdrowia lub ze względów higienicznych, jeżeli opakowanie zostało otwarte po dostarczeniu; (6) w której przedmiotem świadczenia są Produkty - rzeczy ruchome (w tym rzeczy ruchome z elementami cyfrowymi) -, które po dostarczeniu, ze względu na swój charakter, zostają nierozłącznie połączone z innymi rzeczami ruchomymi, w tym rzeczami ruchomymi z elementami cyfrowymi; (7) w której przedmiotem świadczenia są napoje alkoholowe, których cena została uzgodniona przy zawarciu Umowy Sprzedaży, a których dostarczenie może nastąpić dopiero po upływie 30 dni i których wartość zależy od wahań na rynku, nad którymi Sprzedawca nie ma kontroli; (8) w której konsument wyraźnie żądał, aby Sprzedawca do niego przyjechał w celu dokonania pilnej naprawy lub konserwacji; jeżeli Sprzedawca świadczy dodatkowo inne usługi niż te, których wykonania konsument żądał, lub dostarcza Produkty - rzeczy ruchome (w tym rzeczy ruchome z elementami cyfrowymi) -,inne niż części zamienne niezbędne do wykonania naprawy lub konserwacji, prawo odstąpienia od umowy przysługuje konsumentowi w odniesieniu do dodatkowych usług lub Produktów; (9) w której przedmiotem świadczenia są nagrania dźwiękowe lub wizualne albo programy komputerowe dostarczane w zapieczętowanym opakowaniu, jeżeli opakowanie zostało otwarte po dostarczeniu; (10) o dostarczanie dzienników, periodyków lub czasopism, z wyjątkiem umowy o prenumeratę; (11) zawartej w drodze aukcji publicznej; (12) o świadczenie usług w zakresie zakwaterowania, innych niż do celów mieszkalnych, przewozu towarów, najmu samochodów, gastronomii, usług związanych z wypoczynkiem, wydarzeniami rozrywkowymi, sportowymi lub kulturalnymi, jeżeli w umowie oznaczono dzień lub okres świadczenia usługi; (13) o dostarczanie treści cyfrowych niedostarczanych na nośniku materialnym, za które konsument jest zobowiązany do zapłaty ceny, jeżeli Sprzedawca rozpoczął świadczenie za wyraźną i uprzednią zgodą konsumenta, który został poinformowany przed rozpoczęciem świadczenia, że po spełnieniu świadczenia przez Sprzedawcę utraci prawo odstąpienia od umowy, i przyjął to do wiadomości, a Sprzedawca przekazał konsumentowi potwierdzenie, o którym mowa w art. 15 ust. 1 i 2 albo art. 21 ust. 1 Ustawy o Prawach Konsumenta; (14) o świadczenie usług, za które konsument jest zobowiązany do zapłaty ceny w przypadku których konsument wyraźnie zażądał od Sprzedawcy, aby przyjechał do niego w celu dokonania naprawy, a usługa została już w pełni wykonana za wyraźną i uprzednią zgodą konsumenta.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Zawarte w niniejszym punkcie 8. Regulaminu postanowienia dotyczące konsumenta stosuje się dla umów zawartych od dnia 1 stycznia 2021 r. również do Usługobiorcy lub Klienta będącego osobą fizyczną zawierającą umowę bezpośrednio związaną z jej działalnością gospodarczą, gdy z treści tej umowy wynika, że nie posiada ona dla tej osoby charakteru zawodowego, wynikającego w szczególności z przedmiotu wykonywanej przez nią działalności gospodarczej, udostępnionego na podstawie przepisów o Centralnej Ewidencji i Informacji o Działalności Gospodarczej.",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "OPINIE O PRODUKTACH",
                              },
                            ],
                          },
                          {
                            type: "orderedList",
                            attrs: { start: 1, type: null },
                            content: [
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Sprzedawca nie umożliwia swoim Klientom możliwości wystawiania i dostępu do opinii o Produktach oraz o Sklepie Internetowym.",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "NIELEGALNE TREŚCI I INNE TREŚCI NIEZGODNE Z REGULAMINEM",
                              },
                            ],
                          },
                          {
                            type: "orderedList",
                            attrs: { start: 1, type: null },
                            content: [
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Niniejszy punkt Regulaminu zawiera postanowienia wynikające z Aktu o Usługach Cyfrowych w zakresie dotyczącym Sklepu Internetowego i Usługodawcy. Usługobiorca co do zasady nie jest zobowiązany do dostarczania treści podczas korzystania ze Sklepu Internetowego, chyba że Regulamin wymaga podania określonych danych (np. dane do złożenia Zamówienia). Usługobiorca może mieć możliwość dodania opinii lub komentarza w Sklepie Internetowym korzystając z narzędzi udostępnionych w tym celu przez Usługodawcę. W każdym wypadku dostarczania treści przez Usługobiorcę jest on zobowiązany do przestrzegania zasad zawartych w Regulaminie.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        marks: [{ type: "bold" }],
                                        text: "PUNKT KONTAKTOWY",
                                      },
                                      {
                                        type: "text",
                                        text: " - Usługodawca wyznacza adres poczty elektronicznej ",
                                      },
                                      {
                                        type: "text",
                                        marks: [
                                          {
                                            type: "link",
                                            attrs: {
                                              href: `mailto:${CONTACT_EMAIL}`,
                                              target: "_blank",
                                              rel: "noopener noreferrer nofollow",
                                              class: null,
                                            },
                                          },
                                        ],
                                        text: `${CONTACT_EMAIL}`,
                                      },
                                      {
                                        type: "text",
                                        text: " jako pojedynczy punkt kontaktowy. Punkt kontaktowy umożliwia bezpośrednią komunikację Usługodawcy z organami państw członkowskich, Komisją Europejską i Radą Usług Cyfrowych oraz jednocześnie umożliwia odbiorcom usługi (w tym Usługobiorcom) bezpośrednią, szybką i przyjazną komunikację z Usługodawcą drogą elektroniczną, na potrzeby stosowania Aktu o Usługach Cyfrowych. Usługodawca wskazuje język polski do celów komunikacji z jego punktem kontaktowym.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        marks: [{ type: "bold" }],
                                        text: "Procedura zgłaszania Nielegalnych Treści i działania zgodnie z art. 16 Aktu o Usługach Cyfrowych:",
                                      },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Na adres poczty elektronicznej ",
                                              },
                                              {
                                                type: "text",
                                                marks: [
                                                  {
                                                    type: "link",
                                                    attrs: {
                                                      href: `mailto:${CONTACT_EMAIL}`,
                                                      target: "_blank",
                                                      rel: "noopener noreferrer nofollow",
                                                      class: null,
                                                    },
                                                  },
                                                ],
                                                text: `${CONTACT_EMAIL}`,
                                              },
                                              {
                                                type: "text",
                                                text: " dowolna osoba lub dowolny podmiot może zgłosić Usługodawcy obecność określonych informacji, które dana osoba lub dany podmiot uważają za Nielegalne Treści.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Zgłoszenie powinno być wystarczająco precyzyjne i odpowiednio uzasadnione. W tym celu Usługodawca umożliwia i ułatwia dokonywanie na podany wyżej adres poczty elektronicznej zgłoszeń zawierających wszystkie poniższe elementy: (1) wystarczająco uzasadnione wyjaśnienie powodów, dla których dana osoba lub dany podmiot zarzucają, że zgłaszane informacje stanowią Nielegalne Treści; (2) jasne wskazanie dokładnej elektronicznej lokalizacji informacji, takiej jak dokładny adres URL lub dokładne adresy URL, oraz, w stosownych przypadkach, dodatkowe informacje umożliwiające identyfikację Nielegalnych Treści, stosownie do rodzaju treści i konkretnego rodzaju usługi; (3) imię i nazwisko lub nazwę oraz adres e-mail osoby lub podmiotu dokonujących zgłoszenia, z wyjątkiem zgłoszenia dotyczącego informacji uznawanych za związane z jednym z przestępstw, o których mowa w art. 3–7 dyrektywy 2011/93/UE; oraz (4) oświadczenie potwierdzające powzięte w dobrej wierze przekonanie osoby lub podmiotu dokonujących zgłoszenia, że informacje i zarzuty w nim zawarte są prawidłowe i kompletne.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Zgłoszenie, o którym mowa powyżej, uznaje się za dające podstawę do uzyskania faktycznej wiedzy lub wiadomości do celów art. 6 Aktu o Usługach Cyfrowych w odniesieniu do informacji, której dotyczy, jeżeli umożliwia Usługodawcy działającemu z należytą starannością stwierdzenie – bez szczegółowej analizy prawnej – nielegalnego charakteru danej działalności lub informacji.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Jeżeli zgłoszenie zawiera elektroniczne dane kontaktowe osoby lub podmiotu, które dokonały zgłoszenia, Usługodawca bez zbędnej zwłoki przesyła takiej osobie lub takiemu podmiotowi potwierdzenie otrzymania zgłoszenia. Usługodawca powiadamia także bez zbędnej zwłoki taką osobę lub taki podmiot o swojej decyzji w odniesieniu do informacji, których dotyczy zgłoszenie, przekazując informacje na temat możliwości odwołania się od podjętej decyzji.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Usługodawca rozpatruje wszystkie zgłoszenia, które otrzymuje w ramach mechanizmu, o których mowa powyżej, oraz podejmuje decyzje w odniesieniu do informacji, których dotyczą zgłoszenia, w sposób terminowy, niearbitralny i obiektywny oraz z zachowaniem należytej staranności. Jeżeli na potrzeby takiego rozpatrywania lub podejmowania decyzji Usługodawca korzysta ze zautomatyzowanych środków, uwzględnia informacje na ten temat w powiadomieniu, o którym mowa poprzednim punkcie.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        marks: [{ type: "bold" }],
                                        text: "Informacja na temat ograniczeń, które Usługodawca nakłada w związku z korzystaniem z Sklepu Internetowego, w odniesieniu do informacji przekazywanych przez Usługobiorców:",
                                      },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Usługobiorcę obowiązują następujące zasady w przypadku dostarczania jakichkolwiek treści w ramach Sklepu Internetowego:",
                                              },
                                            ],
                                          },
                                          {
                                            type: "orderedList",
                                            attrs: { start: 1, type: null },
                                            content: [
                                              {
                                                type: "listItem",
                                                content: [
                                                  {
                                                    type: "paragraph",
                                                    attrs: { textAlign: null },
                                                    content: [
                                                      {
                                                        type: "text",
                                                        text: "obowiązek korzystania ze Sklepu Internetowego, w tym do zamieszczania treści (np. w ramach opinii lub komentarzy), zgodnie z jego przeznaczeniem, niniejszym Regulaminem oraz w sposób zgodny z prawem i dobrymi obyczajami, mając na uwadze poszanowanie dóbr osobistych oraz praw autorskich i własności intelektualnej Usługodawcy oraz osób trzecich;",
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                              {
                                                type: "listItem",
                                                content: [
                                                  {
                                                    type: "paragraph",
                                                    attrs: { textAlign: null },
                                                    content: [
                                                      {
                                                        type: "text",
                                                        text: "obowiązek wprowadzania treści zgodnych ze stanem faktycznym oraz w sposób niewprowadzający w błąd;",
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                              {
                                                type: "listItem",
                                                content: [
                                                  {
                                                    type: "paragraph",
                                                    attrs: { textAlign: null },
                                                    content: [
                                                      {
                                                        type: "text",
                                                        text: "zakaz dostarczania treści o charakterze bezprawnym, w tym zakaz dostarczania Nielegalnych Treści;",
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                              {
                                                type: "listItem",
                                                content: [
                                                  {
                                                    type: "paragraph",
                                                    attrs: { textAlign: null },
                                                    content: [
                                                      {
                                                        type: "text",
                                                        text: "zakaz przesyłania niezamówionych informacji handlowych (spam) za pośrednictwem Sklepu Internetowego;",
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                              {
                                                type: "listItem",
                                                content: [
                                                  {
                                                    type: "paragraph",
                                                    attrs: { textAlign: null },
                                                    content: [
                                                      {
                                                        type: "text",
                                                        text: "zakaz dostarczania treści naruszających powszechnie przyjęte zasady netykiety, w tym zawierających treści wulgarne lub obraźliwe;",
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                              {
                                                type: "listItem",
                                                content: [
                                                  {
                                                    type: "paragraph",
                                                    attrs: { textAlign: null },
                                                    content: [
                                                      {
                                                        type: "text",
                                                        text: "obowiązek posiadania – w przypadku, gdy jest to konieczne – wszelkich wymaganych praw i zezwoleń do dostarczania takich treści na stronach Sklepu Internetowego, w szczególności praw autorskich lub wymaganych licencji, zezwoleń i zgód na ich wykorzystywanie, rozpowszechnianie, udostępnianie, lub publikację, zwłaszcza prawa publikowania i rozpowszechniania w Sklepie Internetowym oraz prawo do wykorzystania i rozpowszechniania wizerunku bądź danych osobowych w przypadku treści, które obejmują wizerunek lub dane osobowe osób trzecich.",
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                              {
                                                type: "listItem",
                                                content: [
                                                  {
                                                    type: "paragraph",
                                                    attrs: { textAlign: null },
                                                    content: [
                                                      {
                                                        type: "text",
                                                        text: "obowiązek korzystania ze Sklepu Internetowego w sposób nie stwarzający zagrożenia bezpieczeństwa systemu teleinformatycznego Usługodawcy, Sklepu Internetowego lub osób trzecich.",
                                                      },
                                                    ],
                                                  },
                                                ],
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Usługodawca zastrzega sobie prawo moderowania treści dostarczanych przez Usługobiorców na stronę Sklepu Internetowego. Moderowanie odbywa się w dobrej wierze i z należytą starannością oraz z własnej inicjatywy Usługodawcy lub na otrzymane zgłoszenie w celu wykrycia, identyfikacji i usunięcia Nielegalnych Treści lub innych treści niezgodnych z Regulaminem lub uniemożliwienia do nich dostępu lub podejmowania niezbędnych środków, aby spełnić wymogi prawa Unii Europejskiej i prawa krajowego zgodnego z prawem Unii Europejskiej, w tym wymogi określone w Akcie o usługach cyfrowych, bądź też wymogi zawarte w Regulaminie.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Proces moderowania może odbywać się ręcznie przez człowieka lub opierać się na zautomatyzowanych lub częściowo zautomatyzowanych narzędziach ułatwiających Usługodawcy identyfikację Nielegalnych Treści lub innych treści niezgodnych z Regulaminem. Po zidentyfikowaniu takich treści Usługodawca podejmuje decyzję co do ewentualnego usunięcia lub uniemożliwienia dostępu do treści lub w inny sposób ogranicza ich widoczność lub podejmuje inne działania, które uzna za konieczne (np. kontaktuje się z Usługobiorcą celem wyjaśnienia zastrzeżeń i zmiany treści). Usługodawca w sposób jasny i łatwo zrozumiały poinformuje Usługobiorcę, który dostarczył treści (w razie posiadania jego danych kontaktowych) o swojej decyzji, powodach jej podjęcia oraz dostępnych możliwościach odwołania się od tej decyzji.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Usługodawca realizując swoje prawa i obowiązki z Aktu o Usługach Cyfrowych zobowiązany jest działać z należytą starannością, w sposób obiektywny i proporcjonalny oraz z należytym uwzględnieniem praw i prawnie uzasadnionych interesów wszystkich zaangażowanych stron, w tym odbiorców usługi, w szczególności z uwzględnieniem praw zapisanych w Karcie praw podstawowych Unii Europejskiej, takich jak wolność wypowiedzi, wolność i pluralizm mediów i inne prawa podstawowe i wolności.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Wszelkie uwagi, skargi, reklamacje, odwołania lub zastrzeżenia dotyczące decyzji lub innych działań lub brak działań podjętych przez Usługodawcę na podstawie otrzymanego zgłoszenia lub decyzji Usługodawcy podjętej zgodnie z postanowieniami niniejszego Regulaminu mogą być zgłaszane w trybie analogicznym do procedury reklamacyjnej wskazanej w punkcie 6. Regulaminu. Korzystanie z tej procedury jest bezpłatne i umożliwia składanie skarg w sposób elektroniczny na podany adres poczty elektronicznej. Skorzystanie z procedury zgłaszania i rozpatrywania skarg pozostaje bez uszczerbku dla prawa danej osoby lub podmiotu do wszczęcia postępowania przed sądem oraz nie narusza jego innych praw.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Usługodawca rozpatruje wszelkie uwagi, skargi, reklamacje, odwołania lub zastrzeżenia dotyczące decyzji lub innych działań lub brak działań podjętych przez Usługodawcę na podstawie otrzymanego zgłoszenia lub podjętej decyzji w sposób terminowy, niedyskryminujący, obiektywny i niearbitralny. Jeżeli skarga lub inne zgłoszenie zawiera wystarczające powody, aby Usługodawca uznał, że jego decyzja o niepodejmowania działań w odpowiedzi na zgłoszenie jest nieuzasadniona lub że informacje, których dotyczy skarga, nie są nielegalne i niezgodne z Regulaminem, lub zawiera informacje wskazujące, że działanie skarżącego nie uzasadnia podjętego środka, Usługodawca bez zbędnej zwłoki uchyla lub zmienia swoją decyzję co do ewentualnego usunięcia lub uniemożliwienia dostępu do treści lub w inny sposób ograniczenia ich widoczności lub podejmuje inne działania, które uzna za konieczne.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Usługobiorcy, osoby lub podmioty, które dokonały zgłoszenia Nielegalnych Treści, do których skierowane są decyzje Usługodawcy dotyczące Nielegalnych Treści lub treści niezgodnych z Regulaminem, mają prawo wyboru dowolnego organu pozasądowego rozstrzygania sporów certyfikowanego przez koordynatora ds. usług cyfrowych państwa członkowskiego w celu rozstrzygnięcia sporów dotyczących tych decyzji, w tym w odniesieniu do skarg, które nie zostały rozstrzygnięte w ramach wewnętrznego systemu rozpatrywania skarg Usługodawcy.",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: null },
                            content: [
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "POSTANOWIENIA KOŃCOWE",
                              },
                            ],
                          },
                          {
                            type: "orderedList",
                            attrs: { start: 1, type: null },
                            content: [
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Umowy zawierane poprzez Sklep Internetowy zawierane są w języku polskim.",
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "Zmiana Regulaminu:",
                                      },
                                    ],
                                  },
                                  {
                                    type: "orderedList",
                                    attrs: { start: 1, type: null },
                                    content: [
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Usługodawca zastrzega sobie prawo do dokonywania zmian niniejszego Regulaminu z ważnych przyczyn, to jest: zmiany przepisów prawa; zmiany sposobów lub terminów płatności lub dostaw, podlegania obowiązkowi prawnemu lub regulacyjnemu; zmiany zakresu lub formy świadczonych Usług Elektronicznych; dodania nowych Usług Elektronicznych; konieczności przeciwdziałania nieprzewidzianemu i bezpośredniemu zagrożeniu związanemu z ochroną Sklepu Internetowego, w tym Usług Elektronicznych i Usługobiorców/Klientów przed oszustwami, złośliwym oprogramowaniem, spamem, naruszeniem danych lub innymi zagrożeniami dla cyberbezpieczeństwa – w zakresie, w jakim te zmiany wpływają na realizację postanowień niniejszego Regulaminu.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "Powiadomienie o proponowanych zmianach wysyłane jest z wyprzedzeniem co najmniej 15 dni przed dniem wejścia w życie tych zmian, z zastrzeżeniem zmiana może być wprowadzona bez zachowania 15-dniowego okresu powiadomienia w przypadku, gdy Usługodawca: (1) podlega obowiązkowi prawnemu lub regulacyjnemu, na podstawie którego zobowiązany jest do zmiany Regulaminu w sposób, który uniemożliwia mu dotrzymanie 15-dniowego okresu powiadomienia; lub (2) musi w drodze wyjątku zmienić swój Regulamin, aby przeciwdziałać nieprzewidzianemu i bezpośredniemu zagrożeniu związanemu z ochroną Sklepu Internetowego, w tym Usług Elektronicznych i Usługobiorców/Klientów przed oszustwami, złośliwym oprogramowaniem, spamem, naruszeniem danych lub innymi zagrożeniami dla cyberbezpieczeństwa. W dwóch ostatnich przypadkach, o których mowa w zdaniu poprzednim, wprowadzenie zmian następuje ze skutkiem natychmiastowym, chyba że możliwe lub konieczne jest zastosowanie dłuższego terminu wprowadzenia zmian, o czym każdorazowo powiadamia Usługodawca.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "W przypadku umów o charakterze ciągłym (np. świadczenie Usługi Elektronicznej – Konto) Usługobiorca ma prawo rozwiązać umowę z Usługodawcą przed upływem okresu powiadomienia o proponowanych zmianach. Rozwiązanie takie staje się skuteczne w terminie 15 dni od dnia otrzymania powiadomienia. W przypadku zawarcia umowy o charakterze ciągłym, zmieniony Regulamin wiąże Usługobiorcę, jeżeli został prawidłowo powiadomiony o zmianach, zgodnie z okresem powiadomienia przed ich wprowadzeniem i nie rozwiązał w tym okresie umowy. Dodatkowo w dowolnym momencie po otrzymaniu powiadomienia o zmianach, Usługobiorca może zaakceptować wprowadzane zmiany i tym samym zrezygnować z dalszego trwania okresu powiadomienia. W przypadku zawarcia umowy o innym charakterze niż umowy ciągłe, zmiany Regulaminu nie będą w żaden sposób naruszać praw nabytych Usługobiorcy przed dniem wejścia w życie zmian Regulaminu, w szczególności zmiany Regulaminu nie będą miały wpływu na już składane lub złożone Zamówienia oraz zawarte, realizowane lub wykonane Umowy Sprzedaży.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                      {
                                        type: "listItem",
                                        content: [
                                          {
                                            type: "paragraph",
                                            attrs: { textAlign: null },
                                            content: [
                                              {
                                                type: "text",
                                                text: "W wypadku, gdyby zmiana Regulaminu skutkowała wprowadzeniem jakichkolwiek nowych opłat lub podwyższeniem obecnych konsument ma prawo odstąpienia od umowy.",
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                              {
                                type: "listItem",
                                content: [
                                  {
                                    type: "paragraph",
                                    attrs: { textAlign: null },
                                    content: [
                                      {
                                        type: "text",
                                        text: "W sprawach nieuregulowanych w niniejszym Regulaminie mają zastosowanie powszechnie obowiązujące przepisy prawa polskiego, w szczególności: Kodeksu Cywilnego; ustawy o świadczeniu usług drogą elektroniczną z dnia 18 lipca 2002 r. (Dz.U. 2002 nr 144, poz. 1204 ze zm.); Ustawy o Prawach Konsumenta; oraz inne właściwe przepisy powszechnie obowiązującego prawa.",
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: "listItem",
                        content: [
                          {
                            type: "paragraph",
                            attrs: { textAlign: "left" },
                            content: [
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "WZÓR FORMULARZA ODSTĄPIENIA OD UMOWY",
                              },
                              { type: "hardBreak", marks: [{ type: "bold" }] },
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "(ZAŁĄCZNIK NUMER 2 DO USTAWY O PRAWACH KONSUMENTA)",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: "center" },
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "bold" }],
                        text: "Wzór formularza odstąpienia od umowy",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: "center" },
                    content: [
                      {
                        type: "text",
                        text: "(formularz ten należy wypełnić i odesłać tylko w przypadku chęci odstąpienia od umowy)",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [{ type: "text", text: "– Adresat:" }],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: "center" },
                    content: [
                      {
                        type: "text",
                        text: "ACRM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: "center" },
                    content: [
                      {
                        type: "text",
                        text: "ul. Nad Sudołem 24/22, 31-228 Kraków",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: "center" },
                    content: [
                      {
                        type: "text",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: APP_URL,
                              target: "_blank",
                              rel: "noopener noreferrer nofollow",
                              class: null,
                            },
                          },
                        ],
                        text: "acrm.pl",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: "center" },
                    content: [
                      {
                        type: "text",
                        marks: [
                          {
                            type: "link",
                            attrs: {
                              href: `mailto:${CONTACT_EMAIL}`,
                              target: "_blank",
                              rel: "noopener noreferrer nofollow",
                              class: null,
                            },
                          },
                        ],
                        text: `${CONTACT_EMAIL}`,
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "– Ja/My(*) niniejszym informuję/informujemy(*) o moim/naszym odstąpieniu od umowy sprzedaży następujących",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "towarów(*) umowy dostawy następujących towarów(*) umowy o dzieło polegającej na wykonaniu następujących",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "towarów(*)/o świadczenie następującej usługi(*)",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "– Data zawarcia umowy(*)/odbioru(*)",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "– Imię i nazwisko konsumenta(-ów)",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      { type: "text", text: "– Adres konsumenta(-ów)" },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "– Podpis konsumenta(-ów) (tylko jeżeli formularz jest przesyłany w wersji papierowej)",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [{ type: "text", text: "– Data" }],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      { type: "text", text: "(*) Niepotrzebne skreślić." },
                    ],
                  },
                ],
              }}
            />
          </React.Suspense>
        </Section>
      </Container>
    </main>
  );
}
