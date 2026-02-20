import { Heading, Hr, Link, Section, Text } from "@react-email/components";
import { Fragment } from "react";

import { formatCurrency, priceFromGrosz } from "~/lib/utils";

import { EmailBase, colors, fonts } from "./email-base";

const CONTACT_EMAIL = import.meta.env.VITE_COMPANY_EMAIL;
const RETURN_ICON_URL =
  "https://res.cloudinary.com/dk8cu84v7/image/upload/v1769975334/Adobe_Express_-_file_qtvusb_bwcgiv.png";

interface ReturnItem {
  name: string;
  lineTotalInGrosz: number;
}

interface ReturnRequestCustomerEmailProps {
  orderNumber: string;
  items: ReturnItem[];
  totalRefundInGrosz: number;
}

const ReturnRequestCustomerEmail = ({
  orderNumber,
  items,
  totalRefundInGrosz,
}: ReturnRequestCustomerEmailProps) => {
  return (
    <EmailBase
      iconUrl={RETURN_ICON_URL}
      title="Potwierdzenie zgłoszenia zwrotu"
    >
      <Section style={{ padding: "5px 0px" }}>
        <Text
          style={{
            padding: "0px",
            margin: "0px",
            color: colors.primary,
            ...fonts.subheading,
            textAlign: "center",
          }}
        >
          Zamówienie #{orderNumber}
        </Text>
      </Section>

      <Section style={{ padding: "5px 0px" }}>
        <Text
          style={{
            padding: "0px",
            margin: "0px",
            color: colors.secondary,
            ...fonts.paragraph,
          }}
        >
          Otrzymaliśmy Twoje zgłoszenie zwrotu. Skontaktujemy się z Tobą w ciągu
          2 dni roboczych w celu uzgodnienia dalszych kroków.
        </Text>
      </Section>

      <Heading
        style={{
          ...fonts.subheading,
          color: colors.primary,
          margin: "0px",
          padding: "10px 0px 5px 0px",
          textAlign: "left" as const,
        }}
      >
        Przedmioty do zwrotu
      </Heading>

      {items.map((item, index) => (
        <Fragment key={index}>
          <table style={{ width: "100%", marginBottom: "10px" }}>
            <tr>
              <td style={{ verticalAlign: "top" }}>
                <Text style={itemName}>{item.name}</Text>
              </td>
              <td
                style={{
                  verticalAlign: "top",
                  textAlign: "right",
                  width: "100px",
                }}
              >
                <Text style={itemPrice}>
                  {formatCurrency(priceFromGrosz(item.lineTotalInGrosz))}
                </Text>
              </td>
            </tr>
          </table>
          {index < items.length - 1 && (
            <Hr
              style={{
                borderTop: `1px solid ${colors.secondary}`,
                borderBottom: "none",
                borderLeft: "none",
                borderRight: "none",
                margin: "10px 0",
              }}
            />
          )}
        </Fragment>
      ))}

      <Section style={summarySection}>
        <Section style={summaryRow}>
          <Text style={summaryLabel}>Kwota do zwrotu</Text>
          <Text style={summaryValue}>
            {formatCurrency(priceFromGrosz(totalRefundInGrosz))}
          </Text>
        </Section>
      </Section>

      <Section style={{ padding: "10px 0px" }}>
        <Heading
          style={{
            ...fonts.subheading,
            color: colors.primary,
            margin: "0px",
            paddingBottom: "5px",
            textAlign: "left" as const,
          }}
        >
          Co dalej?
        </Heading>
        <Text style={infoText}>
          Skontaktujemy się z Tobą w ciągu 2 dni roboczych w celu uzgodnienia
          dalszych kroków.
        </Text>
        <Text style={infoText}>
          Towar należy odesłać na adres: ul. Nad Sudołem 24/22, 31-228 Kraków.
        </Text>
        <Text style={infoText}>Koszty zwrotu towaru ponosi konsument.</Text>
        <Text style={infoText}>
          Zwrot płatności dokonywany będzie w ciągu 14 dni od otrzymania towaru
          za pośrednictwem oryginalnej metody płatności.
        </Text>
      </Section>

      <Section style={{ padding: "5px 0px" }}>
        <Text
          style={{
            ...fonts.paragraph,
            color: colors.secondary,
            margin: "0px",
            textAlign: "center" as const,
          }}
        >
          W razie pytań skontaktuj się z nami:{" "}
          <Link
            href={`mailto:${CONTACT_EMAIL}`}
            target="_blank"
            style={{
              color: colors.primary,
              textDecoration: "underline",
            }}
          >
            {CONTACT_EMAIL}
          </Link>{" "}
          lub telefonicznie: +48 453 450 597
        </Text>
      </Section>
    </EmailBase>
  );
};

export { ReturnRequestCustomerEmail };

const infoText = {
  ...fonts.paragraph,
  color: colors.secondary,
  margin: "2px 0px",
};

const itemName = {
  ...fonts.paragraph,
  color: colors.primary,
  fontWeight: "500",
  margin: "0px",
  paddingBottom: "5px",
};

const itemPrice = {
  ...fonts.paragraph,
  color: colors.primary,
  fontWeight: "700",
  margin: "0px",
  whiteSpace: "nowrap" as const,
};

const summarySection = {
  margin: "10px 0px",
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "5px 0px",
};

const summaryLabel = {
  ...fonts.subheading,
  color: colors.primary,
  margin: "0px",
};

const summaryValue = {
  ...fonts.subheading,
  color: colors.primary,
  margin: "0px",
};
