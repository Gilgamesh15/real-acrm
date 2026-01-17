import { Container, Section } from "~/components/ui/layout";

import { RichText } from "~/components/shared/rich-text/rich-text";

export default function PrivacyPolicyPage() {
  return (
    <main>
      <Container>
        <Section>
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
                      text: "POLITYKA PRYWATNOŚCI SKLEPU INTERNETOWEGO ",
                    },
                    { type: "text", text: "ACRM.PL" },
                  ],
                },
                {
                  type: "heading",
                  attrs: { textAlign: null, level: 2 },
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
                              text: "PODSTAWY PRZETWARZANIA DANYCH",
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
                              text: "CEL, PODSTAWA I OKRES PRZETWARZANIA DANYCH W SKLEPIE INTERNETOWYM",
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
                              text: "ODBIORCY DANYCH W SKLEPIE INTERNETOWYM ",
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
                              text: "PROFILOWANIE W SKLEPIE INTERNETOWYM",
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
                              text: "PRAWA OSOBY, KTÓREJ DANE DOTYCZĄ",
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
                              text: "COOKIES W SKLEPIE INTERNETOWYM I ANALITYKA",
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
                            { type: "text", text: "POSTANOWIENIA OGÓLNE" },
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
                                      text: "Niniejsza polityka prywatności Sklepu Internetowego ma charakter informacyjny, co oznacza, że nie jest ona źródłem obowiązków dla Usługobiorców lub Klientów Sklepu Internetowego. Polityka prywatności zawiera przede wszystkim zasady dotyczące przetwarzania danych osobowych przez Administratora w Sklepie Internetowym, w tym podstawy, cele i okres przetwarzania danych osobowych oraz prawa osób, których dane dotyczą, a także informacje w zakresie stosowania w Sklepie Internetowym plików Cookies oraz narzędzi analitycznych.",
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
                                      text: "Administratorem danych osobowych zbieranych za pośrednictwem Sklepu Internetowego jest ACRM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ z siedzibą w Krakowie (adres siedziby i adres do doręczeń: ul. Nad Sudołem 24/22, 31-228 Kraków); wpisana do Rejestru Przedsiębiorców Krajowego Rejestru Sądowego pod numerem KRS: 0001193211; sąd rejestrowy, w którym przechowywana jest dokumentacja spółki: Sąd Rejonowy dla Krakowa Śródmieścia w Krakowie XI Wydział Gospodarczy Krajowego Rejestru Sądowego; kapitał zakładowy w wysokości: 5.000,00 zł; NIP: 9452316835; REGON: 542680140, adres poczty elektronicznej: ",
                                    },
                                    {
                                      type: "text",
                                      marks: [
                                        {
                                          type: "link",
                                          attrs: {
                                            href: "mailto:pomoc@acrm.pl",
                                            target: "_blank",
                                            rel: "noopener noreferrer nofollow",
                                            class: null,
                                          },
                                        },
                                      ],
                                      text: "pomoc@acrm.pl",
                                    },
                                    {
                                      type: "text",
                                      text: " oraz numer telefonu kontaktowego: +48 453-450-597 – zwana dalej „",
                                    },
                                    {
                                      type: "text",
                                      marks: [{ type: "bold" }],
                                      text: "Administratorem",
                                    },
                                    {
                                      type: "text",
                                      text: "” i będąca jednocześnie Usługodawcą Sklepu Internetowego i Sprzedawcą.",
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
                                      text: "Dane osobowe w Sklepie Internetowym przetwarzane są przez Administratora zgodnie z obowiązującymi przepisami prawa, w szczególności zgodnie z rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych) – zwanym dalej „",
                                    },
                                    {
                                      type: "text",
                                      marks: [{ type: "bold" }],
                                      text: "RODO",
                                    },
                                    { type: "text", text: "” lub „" },
                                    {
                                      type: "text",
                                      marks: [{ type: "bold" }],
                                      text: "Rozporządzeniem RODO",
                                    },
                                    {
                                      type: "text",
                                      text: "”. Oficjalny tekst Rozporządzenia RODO: ",
                                    },
                                    {
                                      type: "text",
                                      marks: [
                                        {
                                          type: "link",
                                          attrs: {
                                            href: "http://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX%3A32016R0679",
                                            target: "_blank",
                                            rel: "noopener noreferrer nofollow",
                                            class: null,
                                          },
                                        },
                                      ],
                                      text: "http://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX%3A32016R0679",
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
                                      text: "Korzystanie ze Sklepu Internetowego, w tym dokonywanie zakupów jest dobrowolne. Podobnie związane z tym podanie danych osobowych przez korzystającego ze Sklepu Internetowego Usługobiorcę lub Klienta jest dobrowolne, z zastrzeżeniem dwóch wyjątków: (1) ",
                                    },
                                    {
                                      type: "text",
                                      marks: [{ type: "bold" }],
                                      text: "zawieranie umów z Administratorem",
                                    },
                                    {
                                      type: "text",
                                      text: " – niepodanie w przypadkach i w zakresie wskazanym na stronie Sklepu Internetowego oraz w Regulaminie Sklepu Internetowego i niniejszej polityce prywatności danych osobowych niezbędnych do zawarcia i wykonania Umowy Sprzedaży lub umowy o świadczenie Usługi Elektronicznej z Administratorem skutkuje brakiem możliwości zawarcia tejże umowy. Podanie danych osobowych jest w takim wypadku wymogiem umownym i jeżeli osoba, której dane dotyczą chce zawrzeć daną umowę z Administratorem, to jest zobowiązana do podania wymaganych danych. Każdorazowo zakres danych wymaganych do zawarcia umowy wskazany jest uprzednio na stronie Sklepu Internetowego oraz w Regulaminie Sklepu Internetowego; (2) ",
                                    },
                                    {
                                      type: "text",
                                      marks: [{ type: "bold" }],
                                      text: "obowiązki ustawowe Administratora",
                                    },
                                    {
                                      type: "text",
                                      text: " – podanie danych osobowych jest wymogiem ustawowym wynikającym z powszechnie obowiązujących przepisów prawa nakładających na Administratora obowiązek przetwarzania danych osobowych (np. przetwarzanie danych w celu prowadzenia ksiąg podatkowych lub rachunkowych) i brak ich podania uniemożliwi Administratorowi wykonanie tychże obowiązków.",
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
                                      text: "Administrator dokłada szczególnej staranności w celu ochrony interesów osób, których przetwarzane przez niego dane osobowe dotyczą, a w szczególności jest odpowiedzialny i zapewnia, że zbierane przez niego dane są: (1) przetwarzane zgodnie z prawem; (2) zbierane dla oznaczonych, zgodnych z prawem celów i niepoddawane dalszemu przetwarzaniu niezgodnemu z tymi celami; (3) merytorycznie poprawne i adekwatne w stosunku do celów, w jakich są przetwarzane; (4) przechowywane w postaci umożliwiającej identyfikację osób, których dotyczą, nie dłużej niż jest to niezbędne do osiągnięcia celu przetwarzania oraz (5) przetwarzane w sposób zapewniający odpowiednie bezpieczeństwo danych osobowych, w tym ochronę przed niedozwolonym lub niezgodnym z prawem przetwarzaniem oraz przypadkową utratą, zniszczeniem lub uszkodzeniem, za pomocą odpowiednich środków technicznych lub organizacyjnych.",
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
                                      text: "Uwzględniając charakter, zakres, kontekst i cele przetwarzania oraz ryzyko naruszenia praw lub wolności osób fizycznych o różnym prawdopodobieństwie i wadze zagrożenia, Administrator wdraża odpowiednie środki techniczne i organizacyjne, aby przetwarzanie odbywało się zgodnie z Rozporządzeniem RODO i aby móc to wykazać. Środki te są w razie potrzeby poddawane przeglądom i uaktualniane. Administrator stosuje środki techniczne zapobiegające pozyskiwaniu i modyfikowaniu przez osoby nieuprawnione danych osobowych przesyłanych drogą elektroniczną.",
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
                                      text: "Wszelkie słowa, wyrażenia i akronimy występujące w niniejszej polityce prywatności i rozpoczynające się dużą literą (np. ",
                                    },
                                    {
                                      type: "text",
                                      marks: [{ type: "bold" }],
                                      text: "Sprzedawca",
                                    },
                                    { type: "text", text: ", " },
                                    {
                                      type: "text",
                                      marks: [{ type: "bold" }],
                                      text: "Sklep Internetowy",
                                    },
                                    { type: "text", text: ", " },
                                    {
                                      type: "text",
                                      marks: [{ type: "bold" }],
                                      text: "Usługa Elektroniczna",
                                    },
                                    {
                                      type: "text",
                                      text: ") należy rozumieć zgodnie z ich definicją zawartą w Regulaminie Sklepu Internetowego dostępnym na stronach Sklepu Internetowego.",
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
                              text: "PODSTAWY PRZETWARZANIA DANYCH",
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
                                      text: "Administrator uprawniony jest do przetwarzania danych osobowych w przypadkach, gdy – i w takim zakresie, w jakim – spełniony jest co najmniej jeden z poniższych warunków: (1) osoba, której dane dotyczą wyraziła zgodę na przetwarzanie swoich danych osobowych w jednym lub większej liczbie określonych celów; (2) przetwarzanie jest niezbędne do wykonania umowy, której stroną jest osoba, której dane dotyczą, lub do podjęcia działań na żądanie osoby, której dane dotyczą, przed zawarciem umowy; (3) przetwarzanie jest niezbędne do wypełnienia obowiązku prawnego ciążącego na Administratorze; lub (4) przetwarzanie jest niezbędne do celów wynikających z prawnie uzasadnionych interesów realizowanych przez Administratora lub przez stronę trzecią, z wyjątkiem sytuacji, w których nadrzędny charakter wobec tych interesów mają interesy lub podstawowe prawa i wolności osoby, której dane dotyczą, wymagające ochrony danych osobowych, w szczególności gdy osoba, której dane dotyczą, jest dzieckiem.",
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
                                      text: "Przetwarzanie danych osobowych przez Administratora wymaga każdorazowo zaistnienia co najmniej jednej z podstaw wskazanych w pkt. 2.1 polityki prywatności. Konkretne podstawy przetwarzania danych osobowych Usługobiorców i Klientów Sklepu Internetowego przez Administratora są wskazane w kolejnym punkcie polityki prywatności – w odniesieniu do danego celu przetwarzania danych osobowych przez Administratora.",
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
                              text: "CEL, PODSTAWA I OKRES PRZETWARZANIA DANYCH W SKLEPIE INTERNETOWYM",
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
                                      text: "Każdorazowo cel, podstawa i okres oraz odbiorcy danych osobowych przetwarzanych przez Administratora wynika z działań podejmowanych przez danego Usługobiorcę lub Klienta w Sklepie Internetowym lub przez Administratora. Przykładowo jeżeli Klient decyduje się na dokonanie zakupów w Sklepie Internetowym i wybierze odbiór osobisty zakupionego Produktu zamiast przesyłki kurierskiej, to jego dane osobowe będą przetwarzane w celu wykonania zawartej Umowy Sprzedaży, ale nie będą już udostępniane przewoźnikowi realizującemu przesyłki na zlecenie Administratora.",
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
                                      text: "Administrator może przetwarzać dane osobowe w ramach Sklepu Internetowego w następujących celach, na podstawach oraz w okresach wskazanych w poniższej tabeli:",
                                    },
                                    {
                                      type: "table",
                                      content: [
                                        {
                                          type: "tableRow",
                                          content: [
                                            {
                                              type: "tableHeader",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: {
                                                    textAlign: "center",
                                                  },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Cel przetwarzania danych",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableHeader",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: {
                                                    textAlign: "center",
                                                  },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Podstawa prawna przetwarzania danych",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableHeader",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: {
                                                    textAlign: "center",
                                                  },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Okres przechowywania danych",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        {
                                          type: "tableRow",
                                          content: [
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Wykonanie Umowy Sprzedaży lub umowy o świadczenie Usługi Elektronicznej lub podjęcie działań na żądanie osoby, której dane dotyczą, przed zawarciem w/w umów",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Artykuł 6 ust. 1 lit. b) Rozporządzenia RODO (wykonanie umowy) – przetwarzanie jest niezbędne do wykonania umowy, której stroną jest osoba, której dane dotyczą, lub do podjęcia działań na żądanie osoby, której dane dotyczą, przed zawarciem umowy",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Dane są przechowywane przez okres niezbędny do wykonania, rozwiązania lub wygaśnięcia w inny sposób zawartej Umowy Sprzedaży lub umowy o świadczenie Usługi Elektronicznej.",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        {
                                          type: "tableRow",
                                          content: [
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Marketing towarów i usług Administratora",
                                                    },
                                                  ],
                                                },
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "(np. przesyłanie informacji handlowej, w tym marketing bezpośredni, przy użyciu telekomunikacyjnych urządzeń końcowych, takich jak e-mail i telefon, lub automatycznych systemów wywołujących)",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Artykuł 6 ust. 1 lit. f) Rozporządzenia RODO (prawnie uzasadniony interes administratora) – przetwarzanie jest niezbędne do celów wynikających z prawnie uzasadnionych interesów Administratora, do jakich należy marketing bezpośredni  – polegający na dbaniu o interesy i dobry wizerunek Administratora, jego Sklepu Internetowego oraz dążeniu do sprzedaży Produktów – na przykład w związku z wyrażeniem uprzedniej zgody przez osobę, której dane dotyczą (np. podczas zapisu na Newsletter), na przesyłanie informacji handlowej przy użyciu telekomunikacyjnych urządzeń końcowych, takich jak e-mail lub telefon, w zależności od zakresu udzielonej zgody",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Dane są przechowywane przez okres istnienia prawnie uzasadnionego interesu realizowanego przez Administratora, nie dłużej jednak niż przez okres przedawnienia roszczeń Administratora w stosunku do osoby, której dane dotyczą, z tytułu prowadzonej  przez Administratora działalności gospodarczej. Okres przedawnienia określają przepisy prawa, w szczególności Kodeksu Cywilnego (podstawowy termin przedawnienia dla roszczeń związanych z prowadzeniem działalności gospodarczej wynosi trzy lata, a dla Umowy Sprzedaży dwa lata).",
                                                    },
                                                  ],
                                                },
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Administrator nie może przetwarzać danych w celu marketingu bezpośredniego w przypadku wyrażenia skutecznego sprzeciwu w tym zakresie przez osobę, której dane dotyczą.",
                                                    },
                                                  ],
                                                },
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Dodatkowo w przypadku gdy podstawą przetwarzania jest wyrażona zgoda na przesyłąnie informacji handlowej, w tym marketing bezpośredni, przy użyciu telekomunikacyjnych urządzeń końcowych lub automatycznych systemów wywołujących, dane przechowywane są do momentu wycofania zgody przez osobę, której dane dotyczą na dalsze przetwarzanie jej danych w tym celu, lecz bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej wycofaniem.",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        {
                                          type: "tableRow",
                                          content: [
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Prowadzenie ksiąg rachunkowych",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Artykuł 6 ust. 1 lit. c) Rozporządzenia RODO w zw. zart. 74 ust. 2 ustawy o rachunkowości tj. z dnia 30 stycznia 2018 r. (Dz.U. z 2018 r. poz. 395 ze zm.) – przetwarzanie jest niezbędne do wypełnienia obowiązku prawnego ciążącego na Administratorze",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Dane są przechowywane przez okres wymagany przepisami prawa nakazującymi Administratorowi  przechowywanie ksiąg rachunkowych (5 lat, licząc od początku roku następującego po roku obrotowym, którego dane dotyczą).",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        {
                                          type: "tableRow",
                                          content: [
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Ustalenie, dochodzenie lub obrona roszczeń jakie może podnosić Administrator lub jakie mogą być podnoszone wobec Administratora",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Artykuł 6 ust. 1 lit. f) Rozporządzenia RODO (prawnie uzasadniony interes administratora) – przetwarzanie jest niezbędne do celów wynikających z prawnie uzasadnionych interesów Administratora  – polegających na ustaleniu, dochodzeniu lub obronie roszczeń, jakie może podnosić Administrator lub jakie mogą być podnoszone wobec Administratora",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Dane są przechowywane przez okres istnienia prawnie uzasadnionego interesu realizowanego przez Administratora, nie dłużej jednak niż przez okres przedawnienia roszczeń jakie mogą być podnoszone wobec Administratora (podstawowy termin przedawnienia dla roszczeń wobec Administratora wynosi sześć lat).",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        {
                                          type: "tableRow",
                                          content: [
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Korzystanie ze strony Sklepu Internetowego i zapewnienie jej prawidłowego działania",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Artykuł 6 ust. 1 lit. f) Rozporządzenia RODO (prawnie uzasadniony interes administratora) – przetwarzanie jest niezbędne do celów wynikających z prawnie uzasadnionych interesów Administratora – polegających na prowadzeniu i utrzymaniu strony Sklepu Internetowego",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Dane są przechowywane przez okres istnienia prawnie uzasadnionego interesu realizowanego przez Administratora, nie dłużej jednak niż przez okres przedawnienia roszczeń Administratora w stosunku do osoby, której dane dotyczą, z tytułu prowadzonej  przez Administratora działalności gospodarczej. Okres przedawnienia określają przepisy prawa, w szczególności Kodeksu Cywilnego (podstawowy termin przedawnienia dla roszczeń związanych z prowadzeniem działalności gospodarczej wynosi trzy lata, a dla Umowy Sprzedaży dwa lata).",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        {
                                          type: "tableRow",
                                          content: [
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Prowadzenie statystyk i analiza ruchu w Sklepie Internetowym",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Artykuł 6 ust. 1 lit. f) Rozporządzenia RODO (prawnie uzasadniony interes administratora) – przetwarzanie jest niezbędne do celów wynikających z prawnie uzasadnionych interesów Administratora – polegających na prowadzeniu statystyk i analizie ruchu w Sklepie Internetowym celem poprawy funkcjonowania Sklepu Internetowego i zwiększenia sprzedaży Produktów",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "Dane są przechowywane przez okres istnienia prawnie uzasadnionego interesu realizowanego przez Administratora, nie dłużej jednak niż przez okres przedawnienia roszczeń Administratora w stosunku do osoby, której dane dotyczą, z tytułu prowadzonej  przez Administratora działalności gospodarczej. Okres przedawnienia określają przepisy prawa, w szczególności Kodeksu Cywilnego (podstawowy termin przedawnienia dla roszczeń związanych z prowadzeniem działalności gospodarczej wynosi trzy lata, a dla Umowy Sprzedaży dwa lata)",
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
                              text: "ODBIORCY DANYCH W SKLEPIE INTERNETOWYM",
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
                                      text: "Dla prawidłowego funkcjonowania Sklepu Internetowego, w tym dla realizacji zawieranych Umów Sprzedaży konieczne jest korzystanie przez Administratora z usług podmiotów zewnętrznych (takich jak np. dostawca oprogramowania, kurier czy podmiot obsługujący płatności). Administrator korzysta wyłącznie z usług takich podmiotów przetwarzających, którzy zapewniają wystarczające gwarancje wdrożenia odpowiednich środków technicznych i organizacyjnych, tak by przetwarzanie spełniało wymogi Rozporządzenia RODO i chroniło prawa osób, których dane dotyczą.",
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
                                      text: "Przekazanie danych przez Administratora nie następuje w każdym wypadku i nie do wszystkich wskazanych w polityce prywatności odbiorców lub kategorii odbiorców – Administrator przekazuje dane wyłącznie wtedy, gdy jest to niezbędne do realizacji danego celu przetwarzania danych osobowych i tylko w zakresie niezbędnym do jego zrealizowania. Przykładowo, jeżeli Klient korzysta z odbioru osobistego, to jego dane nie będą przekazywane przewoźnikowi współpracującemu z Administratorem. Dane osobowe mogą być przekazywane przez Administratora do państwa trzeciego, przy czym Administrator zapewnia, że w takim przypadku odbywać się to będzie w stosunku do państwa zapewniającego odpowiedni stopień ochrony – zgodny z Rozporządzeniem RODO, a osoba której dane dotyczą ma możliwość uzyskania kopii swoich danych. Administrator przekazuje zebrane dane osobowe jedynie w przypadku oraz w zakresie niezbędnym do zrealizowania danego celu przetwarzania danych zgodnego z niniejszą polityką prywatności.",
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
                                      text: "Dane osobowe Usługobiorców i Klientów Sklepu Internetowego mogą być przekazywane następującym odbiorcom lub kategoriom odbiorców:",
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
                                              text: "przewoźnicy / spedytorzy / brokerzy kurierscy / podmioty obsługujące magazyn i/lub proces wysyłki",
                                            },
                                            {
                                              type: "text",
                                              text: " – w przypadku Klienta, który korzysta w Sklepie Internetowym ze sposobu dostawy Produktu przesyłką pocztową lub przesyłką kurierską, Administrator udostępnia zebrane dane osobowe Klienta wybranemu przewoźnikowi, spedytorowi lub pośrednikowi realizującemu przesyłki na zlecenie Administratora, a jeżeli wysyłka następuje z magazynu zewnętrznego – podmiotowi obsługującemu magazyn i/lub proces wysyłki – w zakresie niezbędnym do zrealizowania dostawy Produktu Klientowi.",
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
                                              text: "podmioty obsługujące płatności elektroniczne lub kartą płatniczą",
                                            },
                                            {
                                              type: "text",
                                              text: " – w przypadku Klienta, który korzysta w Sklepie Internetowym ze sposobu płatności elektronicznych lub kartą płatniczą, Administrator udostępnia zebrane dane osobowe Klienta wybranemu podmiotowi obsługującemu powyższe płatności w Sklepie Internetowym na zlecenie Administratora w zakresie niezbędnym do obsługi płatności realizowanej przez Klienta.",
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
                                              text: "dostawcy usług zaopatrujący Administratora w rozwiązania techniczne, informatyczne oraz organizacyjne, umożliwiające Administratorowi prowadzenie działalności gospodarczej, w tym Sklepu Internetowego i świadczonych za jego pośrednictwem Usług Elektronicznych",
                                            },
                                            {
                                              type: "text",
                                              text: " (w szczególności dostawcy oprogramowania komputerowego do prowadzenia Sklepu Internetowego, dostawcy poczty elektronicznej i hostingu oraz dostawcy oprogramowania do zarządzania firmą i udzielania pomocy technicznej Administratorowi) – Administrator udostępnia zebrane dane osobowe Klienta wybranemu dostawcy działającemu na jego zlecenie jedynie w przypadku oraz w zakresie niezbędnym do zrealizowania danego celu przetwarzania danych zgodnego z niniejszą polityką prywatności.",
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
                                              text: "dostawcy usług księgowych, prawnych i doradczych zapewniający Administratorowi wsparcie księgowe, prawne lub doradcze",
                                            },
                                            {
                                              type: "text",
                                              text: " (w szczególności biuro księgowe, kancelaria prawna lub firma windykacyjna) – Administrator udostępnia zebrane dane osobowe Klienta wybranemu dostawcy działającemu na jego zlecenie jedynie w przypadku oraz w zakresie niezbędnym do zrealizowania danego celu przetwarzania danych zgodnego z niniejszą polityką prywatności.",
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
                              text: "PROFILOWANIE W SKLEPIE INTERNETOWYM",
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
                                      text: "Rozporządzenie RODO nakłada na Administratora obowiązek informowania o zautomatyzowanym podejmowaniu decyzji, w tym o profilowaniu, o którym mowa w art. 22 ust. 1 i 4 Rozporządzenia RODO, oraz – przynajmniej w tych przypadkach – istotne informacje o zasadach ich podejmowania, a także o znaczeniu i przewidywanych konsekwencjach takiego przetwarzania dla osoby, której dane dotyczą. Mając to na uwadze, Administrator podaje w tym punkcie polityki prywatności informacje dotyczące możliwego profilowania.",
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
                                      text: "Administrator może korzystać w Sklepie Internetowym z profilowania do celów marketingu bezpośredniego, ale decyzje podejmowane na jego podstawie przez Administratora nie dotyczą zawarcia lub odmowy zawarcia Umowy Sprzedaży czy też możliwości korzystania z Usług Elektronicznych w Sklepie Internetowym. Efektem korzystania z profilowania w Sklepie Internetowym może być np. przyznanie danej osobie rabatu, przesłanie jej kodu rabatowego, przypomnienie o niedokończonych zakupach, przesłanie propozycji Produktu, który może odpowiadać zainteresowaniom lub preferencjom danej osoby lub też zaproponowanie lepszych warunków w porównaniu do standardowej oferty Sklepu Internetowego. Mimo profilowania to dana osoba podejmuje swobodnie decyzję, czy będzie chciała skorzystać z otrzymanego w ten sposób rabatu, czy też lepszych warunków i dokonać zakupu w Sklepie Internetowym.",
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
                                      text: "Profilowanie w Sklepie Internetowym polega na automatycznej analizie lub prognozie zachowania danej osoby na stronie Sklepu Internetowego np. poprzez dodanie konkretnego Produktu do koszyka, przeglądanie strony konkretnego Produktu w Sklepie Internetowym czy też poprzez analizę dotychczasowej historii dokonanych zakupów w Sklepie Internetowym. Warunkiem takiego profilowania jest posiadanie przez Administratora danych osobowych danej osoby, aby móc jej następnie przesłać np. kod rabatowy. ",
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
                                      text: "Osoba, której dane dotyczą, ma prawo do tego, by nie podlegać decyzji, która opiera się wyłącznie na zautomatyzowanym przetwarzaniu, w tym profilowaniu, i wywołuje wobec tej osoby skutki prawne lub w podobny sposób istotnie na nią wpływa.",
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
                              text: "PRAWA OSOBY, KTÓREJ DANE DOTYCZĄ",
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
                                      text: "Prawo dostępu, sprostowania, ograniczenia, usunięcia lub przenoszenia",
                                    },
                                    {
                                      type: "text",
                                      text: " – osoba, której dane dotyczą, ma prawo żądania od Administratora dostępu do swoich danych osobowych, ich sprostowania, usunięcia („prawo do bycia zapomnianym”) lub ograniczenia przetwarzania oraz ma prawo do wniesienia sprzeciwu wobec przetwarzania, a także ma prawo do przenoszenia swoich danych. Szczegółowe warunki wykonywania wskazanych wyżej praw wskazane są w art. 15-21 Rozporządzenia RODO. ",
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
                                      text: "Prawo do cofnięcia zgody w dowolnym momencie – osoba, której dane przetwarzane są przez Administratora na podstawie wyrażonej zgody (na podstawie art. 6 ust. 1 lit. a) lub art. 9 ust. 2 lit. a) Rozporządzenia RODO), ma prawo do cofnięcia zgody w dowolnym momencie bez wpływu na zgodność z prawem przetwarzania, którego dokonano na podstawie zgody przed jej cofnięciem.",
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
                                      text: "Prawo wniesienia skargi do organu nadzorczego ",
                                    },
                                    {
                                      type: "text",
                                      text: "– osoba, której dane przetwarzane są przez Administratora, ma prawo wniesienia skargi do organu nadzorczego w sposób i trybie określonym w przepisach Rozporządzenia RODO oraz prawa polskiego, w szczególności ustawy o ochronie danych osobowych. Organem nadzorczym w Polsce jest Prezes Urzędu Ochrony Danych Osobowych.",
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
                                      text: "Prawo do sprzeciwu",
                                    },
                                    {
                                      type: "text",
                                      text: " – osoba, której dane dotyczą, ma prawo w dowolnym momencie wnieść sprzeciw – z przyczyn związanych z jej szczególną sytuacją – wobec przetwarzania dotyczących jej danych osobowych opartego na art. 6 ust. 1 lit. e) (interes lub zadania publiczne) lub f) (prawnie uzasadniony interes administratora), w tym profilowania na podstawie tych przepisów. Administratorowi w takim przypadku nie wolno już przetwarzać tych danych osobowych, chyba że wykaże on istnienie ważnych prawnie uzasadnionych podstaw do przetwarzania, nadrzędnych wobec interesów, praw i wolności osoby, której dane dotyczą, lub podstaw do ustalenia, dochodzenia lub obrony roszczeń.",
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
                                      text: "Prawo do sprzeciwu dot. marketingu bezpośredniego",
                                    },
                                    {
                                      type: "text",
                                      text: " – jeżeli dane osobowe są przetwarzane na potrzeby marketingu bezpośredniego, osoba, której dane dotyczą, ma prawo w dowolnym momencie wnieść sprzeciw wobec przetwarzania dotyczących jej danych osobowych na potrzeby takiego marketingu, w tym profilowania, w zakresie, w jakim przetwarzanie jest związane z takim marketingiem bezpośrednim. ",
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
                                      text: "W celu realizacji uprawnień, o których mowa w niniejszym punkcie polityki prywatności, można kontaktować się z Administratorem poprzez przesłanie stosownej wiadomości pisemnie lub pocztą elektroniczną na adres Administratora wskazany na wstępie polityki prywatności lub korzystając z formularza kontaktowego dostępnego na stronie Sklepu Internetowego.",
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
                              text: "COOKIES W SKLEPIE INTERNETOWYM I ANALITYKA",
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
                                      text: "Pliki Cookies (ciasteczka) są to niewielkie informacje tekstowe w postaci plików tekstowych, wysyłane przez serwer i zapisywane po stronie osoby odwiedzającej stronę Sklepu Internetowego (np. na dysku twardym komputera, laptopa, czy też na karcie pamięci smartfonu – w zależności z jakiego urządzenia korzysta odwiedzający nasz Sklep Internetowy). Szczegółowe informacje dot. plików Cookies, a także historię ich powstania można znaleźć m. in. tutaj: ",
                                    },
                                    {
                                      type: "text",
                                      marks: [
                                        {
                                          type: "link",
                                          attrs: {
                                            href: "https://pl.wikipedia.org/wiki/HTTP_cookie",
                                            target: "_blank",
                                            rel: "noopener noreferrer nofollow",
                                            class: null,
                                          },
                                        },
                                      ],
                                      text: "https://pl.wikipedia.org/wiki/HTTP_cookie",
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
                                      text: "Administrator może udostępnić na Stronie narzędzie do łatwego i aktywnego zarządzania plikami Cookies - dostępne po pierwszym wejściu na Stronę, a następnie dostępne w stopce Strony. Aktywne zarządzanie pozwala między innymi na sprawdzenie jakie pliki Cookies są lub mogą być zapisywane podczas korzystania ze Strony, a także na wybór i późniejszą zmianę zakresu i celów stosowania plików Cookies w odniesieniu do urządzenia i osoby odwiedzającej Stronę. Rozpoczynając korzystanie ze Strony osoba odwiedzająca zostanie poproszona o wybór ustawień dotyczących plików Cookies. Możliwa jest późniejsza ich zmiana poprzez zmianę ustawień w ramach tego narzędzia dostępnego na stronie.",
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
                                      text: "Administrator w polityce prywatności przekazuje szereg informacji dotyczących stosowania plików Cookie na Stronie, ich rodzajów i celów stosowania oraz zarządzania nimi z wykorzystaniem np. ustawień przeglądarki internetowej i/lub narzędzia do zarządzania plikami Cookies dostępnego na Stronie. Administrator zachęca do korzystania z narzędzia do zarządzania plikami Cookies dostępnego na Stronie, które pozwala w łatwy sposób aktywnie zarządzać plikami Cookies podczas korzystania ze Strony, a w razie braku jego dostępności do zapoznania się poniższymi informacjami dot. m.in. zarządzania plikami Cookies z poziomu przeglądarki.",
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
                                      text: "Pliki Cookies, które mogą być wysyłane przez stronę Sklepu Internetowego można podzielić na różne rodzaje, według następujących kryteriów:",
                                    },
                                    {
                                      type: "table",
                                      content: [
                                        {
                                          type: "tableRow",
                                          content: [
                                            {
                                              type: "tableHeader",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      marks: [{ type: "bold" }],
                                                      text: "Ze względu na ich dostawcę",
                                                    },
                                                    {
                                                      type: "text",
                                                      text: ": ",
                                                    },
                                                  ],
                                                },
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "1) własne (tworzone przez stronę Sklepu Internetowego Administratora) oraz ",
                                                    },
                                                  ],
                                                },
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "2) należące do osób/podmiotów trzecich (innych niż Administrator)",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableHeader",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      marks: [{ type: "bold" }],
                                                      text: "Ze względu na ich okres przechowywania na urządzeniu osoby odwiedzającej stronę Sklepu Internetowego",
                                                    },
                                                    {
                                                      type: "text",
                                                      text: ": ",
                                                    },
                                                  ],
                                                },
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "1) sesyjne (przechowywane do czasu wylogowania się ze Sklepu Internetowego lub wyłączenia przeglądarki internetowej) oraz ",
                                                    },
                                                  ],
                                                },
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "2) stałe (przechowywane przez określony czas, zdefiniowany przez parametry każdego pliku lub do czasu ręcznego usunięcia)",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableHeader",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      marks: [{ type: "bold" }],
                                                      text: "Ze względu na cel ich stosowania",
                                                    },
                                                    {
                                                      type: "text",
                                                      text: ": ",
                                                    },
                                                  ],
                                                },
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "1) niezbędne (umożliwiające prawidłowe funkcjonowanie strony Sklepu Internetowego), ",
                                                    },
                                                  ],
                                                },
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "2) funkcjonalne/preferencyjne (umożliwiające dostosowanie strony Sklepu Internetowego do preferencji osoby odwiedzającej stronę), ",
                                                    },
                                                  ],
                                                },
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "3) analityczne i wydajnościowe (gromadzące informacje o sposobie korzystania ze strony Sklepu Internetowego),",
                                                    },
                                                  ],
                                                },
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "4) marketingowe, reklamowe i społecznościowe (zbierające informacje o osobie odwiedzającej stronę Sklepu Internetowego w celu wyświetlania tej osobie reklam, ich personalizacji, mierzeniu skuteczności i prowadzenia innych działań marketingowych w tym również na stronach internetowych odrębnych od strony Sklepu Internetowego, takich jak portale społecznościowe albo inne strony należące do tych samych sieci reklamowych co Sklep Internetowy)",
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
                                      text: "Administrator może przetwarzać dane zawarte w plikach Cookies podczas korzystania przez odwiedzających ze strony Sklepu Internetowego w następujących konkretnych celach:",
                                    },
                                    {
                                      type: "table",
                                      content: [
                                        {
                                          type: "tableRow",
                                          content: [
                                            {
                                              type: "tableHeader",
                                              attrs: {
                                                colspan: 1,
                                                rowspan: 5,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      marks: [{ type: "bold" }],
                                                      text: "Cele stosowanie plików Cookies w Sklepie Internetowym Administratora",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 2,
                                                rowspan: 1,
                                                colwidth: null,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "identyfikacji Usługobiorców jako zalogowanych w Sklepie Internetowym i pokazywania, że są zalogowani (pliki Cookies niezbędne)",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        {
                                          type: "tableRow",
                                          content: [
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 2,
                                                rowspan: 1,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "zapamiętywania Produktów dodanych do koszyka w celu złożenia Zamówienia (pliki Cookies niezbędne)",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        {
                                          type: "tableRow",
                                          content: [
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 2,
                                                rowspan: 1,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "zapamiętywania danych z wypełnianych Formularzy Zamówienia, ankiet lub danych logowania do Sklepu Internetowego (pliki Cookies niezbędne lub/i funkcjonalne/preferencyjne)",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        {
                                          type: "tableRow",
                                          content: [
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 2,
                                                rowspan: 1,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "dostosowywania zawartości strony Sklepu Internetowego do indywidualnych preferencji Usługobiorcy (np. dotyczących kolorów, rozmiaru czcionki, układu strony) oraz optymalizacji korzystania ze stron Sklepu Internetowego (pliki Cookies funkcjonalne/preferencyjne)",
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                        {
                                          type: "tableRow",
                                          content: [
                                            {
                                              type: "tableCell",
                                              attrs: {
                                                colspan: 2,
                                                rowspan: 1,
                                              },
                                              content: [
                                                {
                                                  type: "paragraph",
                                                  attrs: { textAlign: null },
                                                  content: [
                                                    {
                                                      type: "text",
                                                      text: "prowadzenia anonimowych statystyk przedstawiających sposób korzystania ze strony Sklepu Internetowego (pliki Cookies analityczne i wydajnościowe)",
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
                                      text: "Sprawdzenie, jakie pliki Cookies są wysyłane w danej chwili przez stronę Sklepu Internetowego, jest możliwe, niezależnie od przeglądarki internetowej, za pomocą narzędzi dostępnych np. na stronie: ",
                                    },
                                    {
                                      type: "text",
                                      marks: [
                                        {
                                          type: "link",
                                          attrs: {
                                            href: "https://www.cookiemetrix.com",
                                            target: "_blank",
                                            rel: "noopener noreferrer nofollow",
                                            class: null,
                                          },
                                        },
                                      ],
                                      text: "https://www.cookiemetrix.com",
                                    },
                                    { type: "text", text: " lub " },
                                    {
                                      type: "text",
                                      marks: [
                                        {
                                          type: "link",
                                          attrs: {
                                            href: "https://www.cookie-checker.com",
                                            target: "_blank",
                                            rel: "noopener noreferrer nofollow",
                                            class: null,
                                          },
                                        },
                                      ],
                                      text: "https://www.cookie-checker.com",
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
                                      text: "Standardowo większość przeglądarek internetowych dostępnych na rynku domyślnie akceptuje zapisywanie plików Cookies. Każdy ma możliwość określenia warunków korzystania z plików Cookies za pomocą ustawień własnej przeglądarki internetowej. Oznacza to, że można np. częściowo ograniczyć (np. czasowo) lub całkowicie wyłączyć możliwość zapisywania plików Cookies – w tym ostatnim wypadku jednak może to mieć wpływ na niektóre funkcjonalności Sklepu Internetowego (przykładowo niemożliwym może okazać się przejście ścieżki Zamówienia poprzez Formularz Zamówienia z uwagi na niezapamiętywanie Produktów w koszyku podczas kolejnych kroków składania Zamówienia).",
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
                                      text: "Ustawienia przeglądarki internetowej w zakresie plików Cookies są istotne z punktu widzenia zgody na korzystanie z plików Cookies przez nasz Sklep Internetowy – zgodnie z przepisami taka zgoda może być również wyrażona poprzez ustawienia przeglądarki internetowej. Szczegółowe informacje na temat zmiany ustawień dotyczących plików Cookies oraz ich samodzielnego usuwania w najpopularniejszych przeglądarkach internetowych dostępne są w dziale pomocy przeglądarki internetowej oraz na poniższych stronach (wystarczy kliknąć w dany link):",
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
                                              marks: [
                                                {
                                                  type: "link",
                                                  attrs: {
                                                    href: "http://support.google.com/chrome/bin/answer.py?hl=pl&answer=95647",
                                                    target: "_blank",
                                                    rel: "noopener noreferrer nofollow",
                                                    class: null,
                                                  },
                                                },
                                              ],
                                              text: "w przeglądarce Chrome",
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
                                              marks: [
                                                {
                                                  type: "link",
                                                  attrs: {
                                                    href: "http://support.mozilla.org/pl/kb/W%C5%82%C4%85czanie%20i%20wy%C5%82%C4%85czanie%20obs%C5%82ugi%20ciasteczek",
                                                    target: "_blank",
                                                    rel: "noopener noreferrer nofollow",
                                                    class: null,
                                                  },
                                                },
                                              ],
                                              text: "w przeglądarce Firefox",
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
                                              marks: [
                                                {
                                                  type: "link",
                                                  attrs: {
                                                    href: "https://support.microsoft.com/pl-pl/help/17442/windows-internet-explorer-delete-manage-cookies",
                                                    target: "_blank",
                                                    rel: "noopener noreferrer nofollow",
                                                    class: null,
                                                  },
                                                },
                                              ],
                                              text: "w przeglądarce Internet Explorer",
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
                                              marks: [
                                                {
                                                  type: "link",
                                                  attrs: {
                                                    href: "https://help.opera.com/pl/latest/web-preferences/#cookies",
                                                    target: "_blank",
                                                    rel: "noopener noreferrer nofollow",
                                                    class: null,
                                                  },
                                                },
                                              ],
                                              text: "w przeglądarce Opera",
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
                                              marks: [
                                                {
                                                  type: "link",
                                                  attrs: {
                                                    href: "https://support.apple.com/pl-pl/guide/safari/sfri11471/11.0/mac/10.13",
                                                    target: "_blank",
                                                    rel: "noopener noreferrer nofollow",
                                                    class: null,
                                                  },
                                                },
                                              ],
                                              text: "w przeglądarce Safari",
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
                                              marks: [
                                                {
                                                  type: "link",
                                                  attrs: {
                                                    href: "http://windows.microsoft.com/pl-pl/windows-10/edge-privacy-faq",
                                                    target: "_blank",
                                                    rel: "noopener noreferrer nofollow",
                                                    class: null,
                                                  },
                                                },
                                              ],
                                              text: "w przeglądarce Microsoft Edge",
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
            }}
          />
        </Section>
      </Container>
    </main>
  );
}
