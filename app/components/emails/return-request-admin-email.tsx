import { Heading, Hr, Section, Text } from "@react-email/components";
import { Fragment } from "react";

import { formatCurrency, priceFromGrosz } from "~/lib/utils";

import { EmailBase, colors, fonts } from "./email-base";

const RETURN_ICON_URL =
  "https://res.cloudinary.com/dk8cu84v7/image/upload/v1769975334/Adobe_Express_-_file_qtvusb_bwcgiv.png";

interface ReturnItem {
  name: string;
  lineTotalInGrosz: number;
}

interface ReturnRequestAdminEmailProps {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: ReturnItem[];
  totalRefundInGrosz: number;
}

const ReturnRequestAdminEmail = ({
  orderNumber,
  customerName,
  customerPhone,
  customerEmail,
  items,
  totalRefundInGrosz,
}: ReturnRequestAdminEmailProps) => {
  return (
    <EmailBase iconUrl={RETURN_ICON_URL} title="Nowe zgłoszenie zwrotu">
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
        <Heading
          style={{
            ...fonts.subheading,
            color: colors.primary,
            margin: "0px",
            paddingBottom: "5px",
            textAlign: "left" as const,
          }}
        >
          Dane klienta
        </Heading>
        <Text style={infoText}>Imię i nazwisko: {customerName}</Text>
        <Text style={infoText}>Telefon: {customerPhone}</Text>
        <Text style={infoText}>Email: {customerEmail}</Text>
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
    </EmailBase>
  );
};

export { ReturnRequestAdminEmail };

const infoText = {
  ...fonts.paragraph,
  color: colors.secondary,
  margin: "0px",
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
