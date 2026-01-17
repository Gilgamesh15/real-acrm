import { Link, Section, Text } from "@react-email/components";

import { EmailBase, colors, fonts } from "./email-base";

const VERIFY_EMAIL_ICON_URL =
  "https://fzfbhbf.stripocdn.email/content/guids/CABINET_67e080d830d87c17802bd9b4fe1c0912/images/55191618237638326.png";
const VERIFY_EMAIL_TITLE = "Potwierdź swój email";

interface VerifyEmailEmailProps {
  verifyUrl: string;
}

export const VerifyEmailEmail = ({ verifyUrl }: VerifyEmailEmailProps) => {
  return (
    <EmailBase iconUrl={VERIFY_EMAIL_ICON_URL} title={VERIFY_EMAIL_TITLE}>
      <Section
        style={{
          padding: "5px 0px",
        }}
      >
        <Text
          style={{
            padding: "0px",
            margin: "0px",
            color: colors.secondary,
            ...fonts.paragraph,
          }}
        >
          Otrzymałeś tę wiadomość, ponieważ Twój adres e-mail został
          zarejestrowany na naszej stronie. Kliknij przycisk poniżej, aby
          zweryfikować swój adres e-mail i potwierdzić, że jesteś właścicielem
          tego konta.
        </Text>
      </Section>

      <Section
        style={{
          margin: "10px 0px",
          padding: "10px 20px",
        }}
      >
        <Link
          href={verifyUrl}
          style={{
            backgroundColor: colors.primary,
            color: colors.background,
            padding: "10px 20px",
            margin: "0 auto",
            ...fonts["button-text"],
            cursor: "pointer",
          }}
        >
          Potwierdź email
        </Link>
      </Section>
      <Section
        style={{
          padding: "0px",
          paddingTop: "10px",
          paddingBottom: "5px",
        }}
      >
        <Text
          style={{
            padding: "0px",
            margin: "0px",
            ...fonts.paragraph,
            color: colors.secondary,
          }}
        >
          Jeśli nie rejestrowałeś się na naszej stronie, zignoruj tę wiadomość.
        </Text>
      </Section>
    </EmailBase>
  );
};

VerifyEmailEmail.PreviewProps = {
  verifyUrl: "https://www.google.com",
} satisfies VerifyEmailEmailProps;

export default VerifyEmailEmail;
