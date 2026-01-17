import { Link, Section, Text } from "@react-email/components";

import { EmailBase, colors, fonts } from "./email-base";

interface ResetPasswordEmailProps {
  resetUrl: string;
}

const RESET_PASSWORD_ICON_URL =
  "https://fzfbhbf.stripocdn.email/content/guids/CABINET_91d375bbb7ce4a7f7b848a611a0368a7/images/69901618385469411.png";
const RESET_PASSWORD_TITLE = "Resetuj hasło";

export const ResetPasswordEmail = ({ resetUrl }: ResetPasswordEmailProps) => {
  return (
    <EmailBase iconUrl={RESET_PASSWORD_ICON_URL} title={RESET_PASSWORD_TITLE}>
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
      <Section
        style={{
          margin: "10px 0px",
          padding: "10px 20px",
        }}
      >
        <Link
          href={resetUrl}
          style={{
            backgroundColor: colors.primary,
            color: colors.background,
            padding: "10px 20px",
            margin: "10px 0px",
            ...fonts["button-text"],
            cursor: "pointer",
          }}
        >
          Resetuj hasło
        </Link>
      </Section>
    </EmailBase>
  );
};

ResetPasswordEmail.PreviewProps = {
  resetUrl: "https://www.google.com",
} satisfies ResetPasswordEmailProps;

export default ResetPasswordEmail;
