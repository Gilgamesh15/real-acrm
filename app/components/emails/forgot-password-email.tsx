import { Link, Section, Text } from "@react-email/components";

import { EmailBase, colors, fonts } from "./email-base";

interface ForgotPasswordEmailProps {
  resetUrl: string;
  userEmail: string;
}

const FORGOT_PASSWORD_ICON_URL =
  "https://fzfbhbf.stripocdn.email/content/guids/CABINET_91d375bbb7ce4a7f7b848a611a0368a7/images/69901618385469411.png";
const FORGOT_PASSWORD_TITLE = "Resetowanie hasła";

const ForgotPasswordEmail = ({
  resetUrl,
  userEmail,
}: ForgotPasswordEmailProps) => (
  <EmailBase iconUrl={FORGOT_PASSWORD_ICON_URL} title={FORGOT_PASSWORD_TITLE}>
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
        Otrzymaliśmy prośbę o zresetowanie hasła dla konta{" "}
        <span style={{ color: colors.primary, fontWeight: "500" }}>
          {userEmail}
        </span>
        . Kliknij przycisk poniżej, aby utworzyć nowe hasło.
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
        <strong style={{ color: colors.primary }}>
          Link wygaśnie za 1 godzinę.
        </strong>
        <br />
        Jeśli nie prosiłeś o zresetowanie hasła, możesz zignorować tę wiadomość.
      </Text>
    </Section>
  </EmailBase>
);

ForgotPasswordEmail.PreviewProps = {
  resetUrl: "https://www.google.com",
  userEmail: "user@example.com",
} satisfies ForgotPasswordEmailProps;

export { ForgotPasswordEmail };
export default ForgotPasswordEmail;
