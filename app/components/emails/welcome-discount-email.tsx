import {
  Container,
  Heading,
  Link,
  Section,
  Text,
} from "@react-email/components";

import { EmailBase, colors, fonts } from "./email-base";

const APP_URL = import.meta.env.VITE_APP_URL;

interface WelcomeDiscountEmailProps {
  discountCode: string;
  unsubscribeToken: string;
}

export const WelcomeDiscountEmail = ({
  discountCode,
  unsubscribeToken,
}: WelcomeDiscountEmailProps) => {
  return (
    <EmailBase
      iconUrl="https://res.cloudinary.com/dvuebzp3i/image/upload/v1776013454/5acbb712-9232-4b5b-b8ec-a1a83d90329e_dtjqm2_hd5qbe.jpg"
      title="Witaj w ACRM!"
    >
      <Section style={{ backgroundColor: colors.background }}>
        <Text
          style={{
            ...fonts.paragraph,
            color: colors.secondary,
            textAlign: "center",
            margin: "0 0 20px",
          }}
        >
          Dziękujemy za zapisanie się do naszego newslettera! Na początek mamy
          dla Ciebie specjalny rabat na pierwsze zamówienie.
        </Text>

        <Container
          style={{
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            padding: "24px",
            textAlign: "center",
            margin: "20px auto",
            maxWidth: "300px",
          }}
        >
          <Text
            style={{
              ...fonts["paragraph-small"],
              color: colors.secondary,
              margin: "0 0 8px",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Twój kod rabatowy
          </Text>
          <Heading
            as="h2"
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: colors.primary,
              margin: "0",
              letterSpacing: "4px",
            }}
          >
            {discountCode}
          </Heading>
          <Text
            style={{
              ...fonts.paragraph,
              color: colors.secondary,
              margin: "8px 0 0",
              fontWeight: "bold",
            }}
          >
            -10% na pierwsze zamówienie
          </Text>
        </Container>

        <Text
          style={{
            ...fonts.paragraph,
            color: colors.secondary,
            textAlign: "center",
            margin: "20px 0 0",
          }}
        >
          Wpisz kod podczas składania zamówienia w polu &quot;Kod
          promocyjny&quot;.
        </Text>
      </Section>

      <Section
        style={{ backgroundColor: colors.background, paddingTop: "20px" }}
      >
        <Text
          style={{
            ...fonts["paragraph-small"],
            color: colors.secondary,
            textAlign: "center",
            margin: "0",
          }}
        >
          Nie chcesz otrzymywać wiadomości?{" "}
          <Link
            href={`${APP_URL}/wypisz-sie?token=${unsubscribeToken}`}
            style={{ color: colors.secondary, textDecoration: "underline" }}
          >
            Wypisz się
          </Link>
        </Text>
      </Section>
    </EmailBase>
  );
};
