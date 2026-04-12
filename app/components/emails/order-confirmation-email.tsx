import { Heading, Hr, Img, Link, Section, Text } from "@react-email/components";
import { Fragment } from "react";

import type { DBQueryResult } from "~/lib/types";
import {
  formatCurrency,
  groupOrderItems,
  orderDetailsFromOrder,
  priceDataToDisplayData,
  priceFromGrosz,
} from "~/lib/utils";

import { EmailBase, colors, fonts } from "./email-base";

const APP_URL = import.meta.env.VITE_APP_URL;
const CONTACT_EMAIL = import.meta.env.VITE_COMPANY_EMAIL;
const ORDER_CONFIRMATION_ICON_URL =
  "https://res.cloudinary.com/dvuebzp3i/image/upload/v1776013405/Adobe_Express_-_file_qtvusb_bwcgiv_hiuemy_p6lema.png";
const ORDER_CONFIRMATION_TITLE = "Potwierdzenie zamówienia";

//TODO Add discount display data
interface OrderConfirmationEmailProps {
  order: DBQueryResult<
    "orders",
    {
      with: {
        items: {
          with: {
            product: {
              columns: {
                description: false;
              };
              with: {
                images: true;
              };
            };
            piece: {
              with: {
                images: true;
                brand: true;
                size: true;
              };
            };
          };
        };
      };
    }
  >;
}

const OrderConfirmationEmail = ({
  order, //= mockOrderArgs.order,
}: OrderConfirmationEmailProps) => {
  const orderDetails = orderDetailsFromOrder(order);

  const { products, pieces } = groupOrderItems(order.items);

  return (
    <EmailBase
      iconUrl={ORDER_CONFIRMATION_ICON_URL}
      title={ORDER_CONFIRMATION_TITLE}
    >
      <Section
        style={{
          padding: "5px 0px",
        }}
      >
        <Text
          style={{
            padding: "0px",
            margin: "0px",
            color: colors.primary,
            ...fonts.subheading,
            textAlign: "center",
          }}
        >
          #{order.orderNumber}
        </Text>
        <Text
          style={{
            padding: "0px",
            margin: "5px 0px 0px 0px",
            color: colors.secondary,
            ...fonts.paragraph,
            textAlign: "center",
          }}
        >
          <span style={{ color: colors.secondary }}>Złożono: </span>
          <span style={{ color: colors.primary }}>
            {new Date(order.createdAt).toLocaleDateString("pl-PL")}
          </span>
        </Text>
      </Section>

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
          Twoje zamówienie zostało złożone, otrzymaliśmy je i przyjmujemy do
          realizacji.
        </Text>
      </Section>

      {/* Items */}
      <Heading
        style={{
          ...fonts.subheading,
          color: colors.primary,
          margin: "0px",
          padding: "10px 0px 5px 0px",
          textAlign: "left" as const,
        }}
      >
        Zamówione projekty
      </Heading>

      {/* Items */}
      {products.map((product, index) => {
        const [primaryImage] = product.images;

        const pricing = priceDataToDisplayData(product);

        return (
          <Fragment key={product.id}>
            <table style={{ width: "100%", marginBottom: "10px" }}>
              <tr>
                <td
                  style={{
                    width: "60px",
                    verticalAlign: "top",
                    paddingRight: "10px",
                  }}
                >
                  <Img
                    src={primaryImage?.url}
                    alt={primaryImage?.alt}
                    width="60"
                    height="60"
                    style={{ objectFit: "cover" }}
                  />
                </td>
                <td style={{ verticalAlign: "top" }}>
                  <Text style={itemName}>{product.name}</Text>
                  {product.pieces?.map((piece) => (
                    <Text key={piece.id} style={pieceName}>
                      • {piece.name}
                    </Text>
                  ))}
                </td>
                <td
                  style={{
                    verticalAlign: "top",
                    textAlign: "right",
                    width: "80px",
                  }}
                >
                  {pricing.hasDiscount ? (
                    <>
                      <Text
                        style={{ ...itemPrice, textDecoration: "line-through" }}
                      >
                        {formatCurrency(pricing.originalPrice)}
                      </Text>
                      <Text
                        style={{
                          ...itemPrice,
                          fontWeight: "bold",
                          marginLeft: "5px",
                        }}
                      >
                        {formatCurrency(pricing.finalPrice)}
                      </Text>
                    </>
                  ) : (
                    <Text style={itemPrice}>
                      {formatCurrency(pricing.finalPrice)}
                    </Text>
                  )}
                </td>
              </tr>
            </table>

            {index < products.length - 1 && (
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
        );
      })}
      {pieces.map((piece, index) => {
        const [primaryImage] = piece.images;

        const pricing = priceDataToDisplayData(piece);

        return (
          <Fragment key={piece.id}>
            <table style={{ width: "100%", marginBottom: "10px" }}>
              <tr>
                <td
                  style={{
                    width: "60px",
                    verticalAlign: "top",
                    paddingRight: "10px",
                  }}
                >
                  <Img
                    src={primaryImage?.url}
                    alt={primaryImage?.alt}
                    width="60"
                    height="60"
                    style={{ objectFit: "cover" }}
                  />
                </td>
                <td style={{ verticalAlign: "top" }}>
                  <Text style={itemName}>{piece.name}</Text>
                </td>
                <td
                  style={{
                    verticalAlign: "top",
                    textAlign: "right",
                    width: "80px",
                  }}
                >
                  {pricing.hasDiscount ? (
                    <>
                      <Text
                        style={{ ...itemPrice, textDecoration: "line-through" }}
                      >
                        {formatCurrency(pricing.originalPrice)}
                      </Text>
                      <Text
                        style={{
                          ...itemPrice,
                          fontWeight: "bold",
                          marginLeft: "5px",
                        }}
                      >
                        {formatCurrency(pricing.finalPrice)}
                      </Text>
                    </>
                  ) : (
                    <Text style={itemPrice}>
                      {formatCurrency(pricing.finalPrice)}
                    </Text>
                  )}
                </td>
              </tr>
            </table>

            {index < pieces.length - 1 && (
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
        );
      })}

      {/* Order Summary */}
      <Section style={summarySection}>
        <Section style={summaryRow}>
          <Text style={summaryLabel}>Suma częściowa</Text>
          <Text style={summaryValue}>
            {formatCurrency(priceFromGrosz(order.subtotalInGrosz))}
          </Text>
        </Section>

        {priceFromGrosz(order.totalDiscountInGrosz) > 0 && (
          <Section style={summaryRow}>
            <Text style={summaryLabel}>Rabat</Text>
            <Text style={summaryValue}>
              -{formatCurrency(priceFromGrosz(order.totalDiscountInGrosz))}
            </Text>
          </Section>
        )}

        <Section style={summaryRowFinal}>
          <Text style={summaryLabelFinal}>Razem</Text>
          <Text style={summaryValueFinal}>
            {formatCurrency(priceFromGrosz(order.totalInGrosz))}
          </Text>
        </Section>
        <Text
          style={{
            ...fonts["paragraph-small"],
            color: colors.secondary,
            margin: "5px 0 0 0",
            textAlign: "right" as const,
          }}
        >
          Zawiera VAT
        </Text>
      </Section>

      {/* Delivery Details */}
      <Section style={deliverySection}>
        <Heading style={deliveryTitle}>Dane dostawy</Heading>

        <Text style={deliveryMethod}>
          {orderDetails.deliveryMethod === "courier"
            ? "Dostawa kurierem"
            : "Paczkomat"}
        </Text>

        {orderDetails.deliveryMethod === "locker" &&
          "lockerCode" in orderDetails && (
            <Text style={deliveryInfo}>{orderDetails.lockerCode}</Text>
          )}

        <Text style={deliveryInfo}>
          {orderDetails.deliveryName} {orderDetails.phoneNumber}
        </Text>
        <Text style={deliveryInfo}>{orderDetails.email}</Text>

        {orderDetails.deliveryMethod === "courier" && (
          <>
            <Text style={deliveryInfo}>
              {orderDetails.deliveryAddress.line1}{" "}
              {orderDetails.deliveryAddress.line2 &&
                `/${orderDetails.deliveryAddress.line2}`}
            </Text>
            <Text style={deliveryInfo}>
              {orderDetails.deliveryAddress.postalCode}{" "}
              {orderDetails.deliveryAddress.city}{" "}
            </Text>
            <Text style={deliveryInfo}>
              {orderDetails.deliveryAddress.country}
            </Text>
          </>
        )}
      </Section>

      <Text
        style={{
          ...fonts.paragraph,
          textAlign: "center" as const,
          color: colors.secondary,
          padding: "5px 0px",
          margin: "0px",
        }}
      >
        Otrzymasz kolejny email z etykietą InPost, gdy zamówienie zostanie
        przygotowane i przekazane do InPost.
      </Text>

      {/* Return Policy */}
      <Text
        style={{
          ...fonts["paragraph-small"],
          color: colors.secondary,
          padding: "5px 0px",
          margin: "0px",
          textAlign: "center" as const,
        }}
      >
        Masz prawo odstąpić od tej umowy w ciągu 14 dni kalendarzowych od daty
        otrzymania towaru, bez podawania przyczyny. <br />
        Aby skorzystać z tego prawa, wyślij nam informację o rezygnacji na adres
        <Link
          href={`mailto:${CONTACT_EMAIL}`}
          target="_blank"
          style={{
            color: colors.primary,
            textDecoration: "underline",
            fontSize: fonts["paragraph-small"].fontSize,
          }}
        >
          {CONTACT_EMAIL}
        </Link>{" "}
        lub złóż oświadczenie poprzez formularz dostępny na
        <Link
          href={`${APP_URL}/zwroty`}
          target="_blank"
          style={{
            color: colors.primary,
            textDecoration: "underline",
            fontSize: fonts["paragraph-small"].fontSize,
          }}
        >
          {APP_URL}/zwroty
        </Link>
        . <br />
        Towar należy odesłać na adres: ul. Nad Sudołem 24/22, 31-228 Kraków w
        ciągu 14 dni od złożenia oświadczenia o odstąpieniu. <br />
        Koszty zwrotu towaru ponosi konsument. <br />
        Zwrot płatności dokonywany będzie w ciągu 14 dni od otrzymania towaru.
      </Text>
    </EmailBase>
  );
};

export { OrderConfirmationEmail };

// Enhanced Summary Styles
const summarySection = {
  margin: "10px 0px",
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "5px 0px",
  borderBottom: `1px solid ${colors.secondary}`,
};

const summaryRowFinal = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "5px 0px",
};

const summaryLabel = {
  ...fonts.paragraph,
  color: colors.secondary,
  margin: "0px",
};

const summaryValue = {
  ...fonts.paragraph,
  color: colors.primary,
  fontWeight: "500",
  margin: "0px",
};

const summaryLabelFinal = {
  ...fonts.subheading,
  color: colors.primary,
  margin: "0px",
};

const summaryValueFinal = {
  ...fonts.subheading,
  color: colors.primary,
  margin: "0px",
};

// Enhanced Delivery Styles
const deliverySection = {
  margin: "10px 0px",
};

const deliveryTitle = {
  ...fonts.subheading,
  color: colors.primary,
  margin: "0px",
  paddingBottom: "5px",
};

const deliveryMethod = {
  ...fonts.paragraph,
  color: colors.primary,
  fontWeight: "500",
  margin: "0px",
  paddingBottom: "5px",
};

const deliveryInfo = {
  ...fonts.paragraph,
  color: colors.secondary,
  margin: "0px",
};

// Simplified Item Styles
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

const pieceName = {
  ...fonts.paragraph,
  color: colors.secondary,
  margin: "0px",
};
