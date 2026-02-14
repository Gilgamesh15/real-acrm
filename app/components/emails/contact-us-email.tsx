import { Body, Font, Head, Html, Text } from "@react-email/components";

import { colors, fonts } from "./email-base";

export const ContactUsEmail = ({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) => {
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
        <Text
          style={{
            padding: "0px",
            margin: "0px",
            color: colors.secondary,
            ...fonts.paragraph,
          }}
        >
          Imię i nazwisko: {name}
        </Text>
        <Text
          style={{
            padding: "0px",
            margin: "0px",
            color: colors.secondary,
            ...fonts.paragraph,
          }}
        >
          Adres e-mail: {email}
        </Text>
        <Text
          style={{
            padding: "0px",
            margin: "0px",
            color: colors.secondary,
            ...fonts.paragraph,
          }}
        >
          Wiadomość: {message}
        </Text>
      </Body>
    </Html>
  );
};
