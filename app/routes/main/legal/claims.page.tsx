import React from "react";

import { Container, Section } from "~/components/ui/layout";

import type { Route } from "./+types/claims.page";

const CONTACT_EMAIL = import.meta.env.VITE_COMPANY_EMAIL;
const PAGE_TITLE = "Reklamacje | ACRM";

export const meta: Route.MetaFunction = () => [{ title: PAGE_TITLE }];

const RichText = React.lazy(() =>
  import("~/components/shared/rich-text/rich-text").then((mod) => ({
    default: mod.RichText,
  }))
);

export default function ClaimsPage() {
  return (
    <main>
      <Container>
        <Section>
          <React.Suspense fallback={null}>
            <RichText
              className=" legal-text"
              content={{
                type: "doc",
                content: [
                  {
                    type: "heading",
                    attrs: { textAlign: "center", level: 1 },
                    content: [{ type: "text", text: "REKLAMACJE" }],
                  },
                  {
                    type: "heading",
                    attrs: { textAlign: "left", level: 2 },
                    content: [{ type: "text", text: "Jak złożyć reklamację" }],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "Wszystkie reklamacje dotyczące produktów lub sklepu internetowego możesz złożyć:",
                      },
                    ],
                  },
                  {
                    type: "bulletList",
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
                                marks: [{ type: "bold" }],
                                text: "w formie elektronicznej za pośrednictwem poczty elektronicznej",
                              },
                              { type: "text", text: " na adres: " },
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
                                text: `${CONTACT_EMAIL}.`,
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "Przesłanie lub zwrot produktu w ramach reklamacji może nastąpić na adres: ul. Nad Sudołem 24/22, 31-228 Kraków",
                      },
                    ],
                  },
                  {
                    type: "heading",
                    attrs: { textAlign: null, level: 2 },
                    content: [
                      { type: "text", text: "Co napisać w reklamacji" },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "Zaleca się podanie w opisie reklamacji:",
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
                                text: "informacji i okoliczności dotyczących przedmiotu reklamacji, w szczególności rodzaju i daty wystąpienia nieprawidłowości lub braku zgodności z umową;",
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
                                text: "żądania sposobu doprowadzenia do zgodności z umową lub oświadczenia o obniżeniu ceny albo odstąpieniu od umowy lub innego roszczenia; oraz",
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
                                text: "danych kontaktowych składającego reklamację – ułatwi to i przyspieszy rozpatrzenie reklamacji.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "Wymogi podane powyżej mają formę jedynie zalecenia i nie wpływają na skuteczność reklamacji złożonych z pominięciem zalecanego opisu reklamacji. W razie zmiany podanych danych kontaktowych przez składającego reklamację w trakcie rozpatrywania reklamacji zobowiązany jest on do powiadomienia o tym Sprzedawcy.",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "Do reklamacji mogą zostać załączone przez składającego reklamację dowody (np. zdjęcia, dokumenty lub produkt) związane z przedmiotem reklamacji.",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "Możemy także zwrócić się do składającego reklamację z prośbą o podanie dodatkowych informacji lub przesłanie dowodów (np. zdjęcia), jeżeli ułatwi to i przyspieszy rozpatrzenie reklamacji przez nas.",
                      },
                    ],
                  },
                  {
                    type: "heading",
                    attrs: { textAlign: null, level: 2 },
                    content: [
                      {
                        type: "text",
                        text: "Kiedy otrzymasz odpowiedź na reklamację",
                      },
                    ],
                  },
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
                  {
                    type: "heading",
                    attrs: { textAlign: null, level: 2 },
                    content: [
                      {
                        type: "text",
                        text: "Gdzie znajdziesz regulacje prawne dotyczące reklamacji",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "Podstawa i zakres odpowiedzialności za zgodność produktu z umową są określone powszechnie obowiązującymi przepisami prawa, w szczególności w Kodeksie Cywilnym, Ustawie o Prawach Konsumenta oraz ustawie o świadczeniu usług drogą elektroniczną z dnia 18 lipca 2002 r. (Dz.U. Nr 144, poz. 1204 ze zm.).",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "Mamy jeden rodzaj odpowiedzialności za zgodność produktu z umową:",
                      },
                    ],
                  },
                  {
                    type: "bulletList",
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
                                text: "ustawową Sprzedawcy",
                              },
                              {
                                type: "text",
                                text: " – jest to odpowiedzialność wynikająca z przepisów prawa, poniżej znajdziesz szczegółowe informacje, gdzie jest ona uregulowana, tej odpowiedzialności nie można wyłączyć w przypadku konsumentów;",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "Poniżej znajdziesz szczegółowe regulacje dotyczące odpowiedzialności Sprzedawcy na podstawie przepisów prawa (rzecz ruchoma):",
                      },
                    ],
                  },
                  {
                    type: "bulletList",
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
                                text: "Postanowienia dotyczące ",
                              },
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "reklamacji produktu – rzeczy ruchomej (w tym rzeczy ruchomej z elementami cyfrowymi)",
                              },
                              {
                                type: "text",
                                text: ", z wyłączeniem jednak rzeczy ruchomej, która służy wyłącznie jako nośnik treści cyfrowej – zakupionego przez Klienta na podstawie ",
                              },
                              {
                                type: "text",
                                marks: [{ type: "bold" }],
                                text: "umowy sprzedaży zawartej ze Sprzedawcą od dnia 1. stycznia 2023 r.",
                              },
                              {
                                type: "text",
                                text: " określają przepisy Ustawy o Prawach Konsumenta w brzmieniu obowiązującym od dnia 1. stycznia 2023 r., w szczególności art. 43a - 43g Ustawy o Prawach Konsumenta. Przepisy te określają w szczególności podstawę i zakres odpowiedzialności Sprzedawcy względem konsumenta, w razie braku zgodności produktu z umową sprzedaży.",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  { type: "paragraph", attrs: { textAlign: null } },
                ],
              }}
            />
          </React.Suspense>
        </Section>
      </Container>
    </main>
  );
}
