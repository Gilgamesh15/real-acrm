import React from "react";

import { Container, Section } from "~/components/ui/layout";

import type { Route } from "./+types/right-of-withdrawal.page";

const CONTACT_EMAIL = import.meta.env.VITE_COMPANY_EMAIL;
const PAGE_TITLE = "Prawo odstąpienia od umowy | ACRM";
export const meta: Route.MetaFunction = () => [{ title: PAGE_TITLE }];

const RichText = React.lazy(() =>
  import("~/components/shared/rich-text/rich-text").then((mod) => ({
    default: mod.RichText,
  }))
);

export default function RightOfWithdrawalPage() {
  return (
    <main>
      <Container>
        <Section>
          <React.Suspense fallback={null}>
            <RichText
              className="font-tertiary legal-text"
              content={{
                type: "doc",
                content: [
                  {
                    type: "heading",
                    attrs: { textAlign: "center", level: 1 },
                    content: [
                      {
                        type: "text",
                        text: "Informacja o prawie odstąpienia od umowy od umowy zawartej na odległość",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "Będąc konsumentem mają Państwo prawo odstąpić od umowy zawartej w Sklepie Internetowym w terminie 14 dni bez podania jakiejkolwiek przyczyny. Termin do odstąpienia od umowy wygasa po upływie 14 dni od dnia, w którym weszli Państwo w posiadanie rzeczy lub w którym osoba trzecia inna niż przewoźnik i wskazana przez Państwa weszła w posiadanie rzeczy. Aby skorzystać z prawa odstąpienia od umowy, muszą Państwo poinformować nas o swojej decyzji o odstąpieniu od niniejszej umowy w drodze jednoznacznego oświadczenia (na przykład pismo wysłane pocztą tradycyjną lub pocztą elektroniczną). Oświadczenie mogą Państwo przesłać na przykład:",
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
                                text: "pisemnie na adres: ACRM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ Nad Sudołem 24/22, 31-228 Kraków",
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
                        text: "Przykładowy wzór formularza odstąpienia od umowy zawarty jest w załączniku nr 2 do Ustawy o Prawach Konsumenta oraz dodatkowo stanowi załącznik do regulaminu Sklepu Internetowego. Mogą Państwo skorzystać z wzoru formularza odstąpienia od umowy, jednak nie jest to obowiązkowe.",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "Aby zachować termin do odstąpienia od umowy, wystarczy, aby wysłali Państwo informację dotyczącą wykonania przysługującego Państwu prawa odstąpienia od umowy przed upływem terminu do odstąpienia od umowy.",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "W przypadku odstąpienia od niniejszej umowy zwracamy Państwu wszystkie otrzymane od Państwa płatności, w tym koszty dostarczenia rzeczy (z wyjątkiem dodatkowych kosztów wynikających z wybranego przez Państwa sposobu dostarczenia innego niż najtańszy zwykły sposób dostarczenia oferowany przez nas), niezwłocznie, a w każdym przypadku nie później niż 14 dni od dnia, w którym zostaliśmy poinformowani o Państwa decyzji o wykonaniu prawa odstąpienia od niniejszej umowy. Zwrotu płatności dokonamy przy użyciu takich samych sposobów płatności, jakie zostały przez Państwa użyte w pierwotnej transakcji, chyba że wyraźnie zgodziliście się Państwo na inne rozwiązanie; w każdym przypadku nie poniosą Państwo żadnych opłat w związku z tym zwrotem. Możemy wstrzymać się ze zwrotem płatności do czasu otrzymania rzeczy lub do czasu dostarczenia nam dowodu jej odesłania, w zależności od tego, które zdarzenie nastąpi wcześniej. Jeżeli otrzymali Państwo zakupioną rzecz, to proszę odesłać lub przekazać ją nam na adres: ul. Nad Sudołem 24/22, 31-228 Przykładowo, niezwłocznie, a w każdym razie nie później niż 14 dni od dnia, w którym poinformowali nas Państwo o odstąpieniu od umowy. Termin jest zachowany, jeżeli odeślą Państwo rzecz przed upływem terminu 14 dni. Będą Państwo musieli ponieść bezpośrednie koszty zwrotu rzeczy. Odpowiadają Państwo tylko za zmniejszenie wartości rzeczy wynikające z korzystania z niej w sposób inny niż było to konieczne do stwierdzenia charakteru, cech i funkcjonowania rzeczy.",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    attrs: { textAlign: null },
                    content: [
                      {
                        type: "text",
                        text: "Zawarte w tym komunikacie zapisy dotyczące konsumenta stosuje się od dnia 1 stycznia 2021 r. i dla umów zawartych od tego dnia również do kupującego będącego osobą fizyczną zawierającą umowę bezpośrednio związaną z jej działalnością gospodarczą, gdy z treści tej umowy wynika, że nie posiada ona dla tej osoby charakteru zawodowego, wynikającego w szczególności z przedmiotu wykonywanej przez nią działalności gospodarczej, udostępnionego na podstawie przepisów o Centralnej Ewidencji i Informacji o Działalności Gospodarczej.",
                      },
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
