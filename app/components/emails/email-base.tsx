import {
  Body,
  Column,
  Container,
  Font,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type * as React from "react";

const APP_URL = import.meta.env.VITE_APP_URL;
const LIGHT_LOGO_URL = import.meta.env.VITE_LIGHT_LOGO_URL;
const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL;
const TIKTOK_URL = import.meta.env.VITE_TIKTOK_URL;
const YOUTUBE_URL = import.meta.env.VITE_YOUTUBE_URL;

interface EmailBaseProps {
  iconUrl: string;
  title: string;
  children: React.ReactNode;
}

export const EmailBase = ({ iconUrl, title, children }: EmailBaseProps) => {
  return (
    <Html
      style={{
        padding: "0px",
        margin: "0px",
        backgroundColor: colors.background,
        width: "100%",
        height: "100%",
      }}
    >
      <Head>
        <Font
          fontFamily="arial, 'helvetica neue', helvetica, sans-serif"
          fallbackFontFamily="Arial"
          fontWeight="normal"
        />
      </Head>

      <Body
        style={{
          padding: "20px",
          paddingBottom: "0px",
          margin: "0px",
          fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
          textAlign: "center",
          color: colors.primary,
          fontSize: fonts["paragraph"].fontSize,
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            padding: "10px 20px",
            margin: "0 auto",
            backgroundColor: colors.background,
          }}
        >
          <Section
            style={{
              marginBottom: "20px",
              backgroundColor: colors.background,
            }}
          >
            <Link
              href={APP_URL}
              target="_blank"
              style={{
                display: "block",
                margin: "0 auto",
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              <Img
                src={LIGHT_LOGO_URL}
                width={200}
                alt="Logo"
                className="only-on-light"
              />
            </Link>
          </Section>
          <Section
            style={{
              backgroundColor: colors.background,
            }}
          >
            <Row
              style={{
                justifyContent: "center",
                backgroundColor: colors.background,
              }}
            >
              <Column style={{ backgroundColor: colors.background }}>
                <Link
                  href={`${APP_URL}`}
                  target="_blank"
                  style={{
                    padding: "5px 10px",
                    cursor: "pointer",
                    color: colors.secondary,
                  }}
                >
                  Sklep
                </Link>
              </Column>
              <Column style={{ backgroundColor: colors.background }}>
                <Link
                  href={`${APP_URL}/projekty`}
                  target="_blank"
                  style={{
                    padding: "5px 10px",
                    cursor: "pointer",
                    color: colors.secondary,
                  }}
                >
                  Projekty
                </Link>
              </Column>
              <Column style={{ backgroundColor: colors.background }}>
                <Link
                  href={`${APP_URL}/kategorie`}
                  target="_blank"
                  style={{
                    padding: "5px 10px",
                    cursor: "pointer",
                    color: colors.secondary,
                  }}
                >
                  Ubrania
                </Link>
              </Column>
              <Column style={{ backgroundColor: colors.background }}>
                <Link
                  href={`${APP_URL}/regulamin/o-nas`}
                  target="_blank"
                  style={{
                    padding: "5px 10px",
                    cursor: "pointer",
                    color: colors.secondary,
                  }}
                >
                  O nas
                </Link>
              </Column>
            </Row>
          </Section>
        </Container>
        <Container
          style={{
            maxWidth: "600px",
            padding: "30px 20px",
            margin: "0 auto",
            backgroundColor: colors.background,
          }}
        >
          <Section
            style={{
              margin: "10px 0px",
              backgroundColor: colors.background,
            }}
          >
            <Img
              src={iconUrl}
              width={100}
              alt="Logo"
              style={{
                display: "block",
                margin: "0 auto",
                width: "100px",
                height: "auto",
              }}
            />
          </Section>

          <Heading
            style={{
              padding: "0px",
              margin: "0px",
              paddingBottom: "10px",
              color: colors.primary,
              backgroundColor: colors.background,
              ...fonts.heading,
            }}
          >
            {title}
          </Heading>

          {children}
        </Container>

        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "20px",
            paddingBottom: "0px",
            backgroundColor: colors.background,
          }}
        >
          <Section
            style={{
              margin: "15px 0px",
              backgroundColor: colors.background,
            }}
          >
            <Row
              style={{
                width: "fit-content",
                backgroundColor: colors.background,
              }}
            >
              <Column
                style={{
                  width: "72px",
                  backgroundColor: colors.background,
                }}
              >
                <Link
                  href={INSTAGRAM_URL}
                  target="_blank"
                  style={{
                    color: colors.primary,
                    margin: "0 auto",
                    display: "block",
                    width: "32px",
                    height: "32px",
                  }}
                >
                  <Img
                    src="https://fzfbhbf.stripocdn.email/content/assets/img/social-icons/logo-white/instagram-logo-white.png"
                    alt="Inst"
                    width={32}
                    title="Instagram"
                    height={32}
                  />
                </Link>
              </Column>
              <Column
                style={{
                  width: "72px",
                  backgroundColor: colors.background,
                }}
              >
                <Link
                  href={TIKTOK_URL}
                  target="_blank"
                  style={{
                    color: colors.primary,
                    margin: "0 auto",
                    display: "block",
                    width: "32px",
                    height: "32px",
                  }}
                >
                  <Img
                    alt="Tt"
                    width={32}
                    title="TikTok"
                    src="https://fzfbhbf.stripocdn.email/content/assets/img/social-icons/logo-white/tiktok-logo-white.png"
                    height={32}
                  />
                </Link>
              </Column>
              <Column
                style={{
                  width: "72px",
                  backgroundColor: colors.background,
                }}
              >
                <Link
                  href={YOUTUBE_URL}
                  target="_blank"
                  style={{
                    color: colors.primary,
                    margin: "0 auto",
                    display: "block",
                    width: "32px",
                    height: "32px",
                  }}
                >
                  <Img
                    alt="Yt"
                    width={32}
                    title="Youtube"
                    src="https://fzfbhbf.stripocdn.email/content/assets/img/social-icons/logo-white/youtube-logo-white.png"
                    height={32}
                  />
                </Link>
              </Column>
            </Row>
          </Section>
          <Section
            style={{
              paddingBottom: "35px",
              backgroundColor: colors.background,
            }}
          >
            <Text
              style={{
                padding: "0px",
                margin: "0px",
                color: colors.secondary,
                fontSize: fonts["paragraph"].fontSize,
                backgroundColor: colors.background,
              }}
            >
              ACRM sp. z o.o. <br />
              ul. Nad Sudołem 24/22, 31-228 Kraków, Polska <br />© 2025 ACRM sp.
              z o.o.
            </Text>
          </Section>
          <Section
            style={{
              backgroundColor: colors.background,
            }}
          >
            <Row style={{ backgroundColor: colors.background }}>
              <Column
                style={{
                  borderRight: `1px solid ${colors.secondary}`,
                  width: "33.33%",
                  backgroundColor: colors.background,
                }}
              >
                <Link
                  href={`${APP_URL}`}
                  target="_blank"
                  style={{
                    color: colors.secondary,
                    fontSize: fonts["paragraph-small"].fontSize,
                    cursor: "pointer",
                    padding: "5px 0px",
                  }}
                >
                  Strona główna
                </Link>
              </Column>
              <Column
                style={{
                  borderRight: `1px solid ${colors.secondary}`,
                  width: "33.33%",
                  backgroundColor: colors.background,
                }}
              >
                <Link
                  href={`${APP_URL}/regulamin/polityka-prywatnosci`}
                  target="_blank"
                  style={{
                    color: colors.secondary,
                    fontSize: fonts["paragraph-small"].fontSize,
                    cursor: "pointer",
                    padding: "5px 0px",
                  }}
                >
                  Polityka prywatności
                </Link>
              </Column>
              <Column
                style={{
                  width: "33.33%",
                  backgroundColor: colors.background,
                }}
              >
                <Link
                  href={`${APP_URL}/regulamin`}
                  target="_blank"
                  style={{
                    color: colors.secondary,
                    fontSize: fonts["paragraph-small"].fontSize,
                    cursor: "pointer",
                    padding: "5px 0px",
                  }}
                >
                  Regulamin
                </Link>
              </Column>
            </Row>
          </Section>
        </Container>

        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "20px",
            backgroundColor: colors.background,
          }}
        >
          <Text
            style={{
              padding: "0px",
              margin: "0px",
              color: colors.secondary,
              fontSize: fonts["paragraph-small"].fontSize,
              backgroundColor: colors.background,
            }}
          >
            Nie chcesz już otrzymywać tych wiadomości?{" "}
            <Link
              href={`${APP_URL}/anuluj-subskrybcje`}
              target="_blank"
              style={{
                textDecoration: "underline",
                color: colors.primary,
                fontSize: fonts["paragraph-small"].fontSize,
                cursor: "pointer",
              }}
            >
              Wypisz się
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const colors = {
  primary: "#000000",
  secondary: "#737373",
  background: "#FAFAFA",
};

export const fonts = {
  heading: {
    fontSize: "46px",
    fontWeight: "bold",
    lineHeight: 1.2,
    letterSpacing: 0,
  },
  subheading: {
    fontSize: "20px",
    fontWeight: "bold",
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  paragraph: {
    fontSize: "14px",
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  "button-text": {
    fontSize: "20px",
    fontWeight: "normal",
    lineHeight: 1.2,
    letterSpacing: 0,
  },
  "paragraph-small": {
    fontSize: "12px",
  },
};
