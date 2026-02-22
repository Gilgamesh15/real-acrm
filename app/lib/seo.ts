import type {
  DBQueryResult,
  Gender,
  ProductStatus,
  RichText,
} from "~/lib/types";

import { COMPANY_INFO } from "./company-info";
import {
  calculatePiecePriceDisplayData,
  calculateProductPriceDisplayData,
} from "./utils";

const BASE_URL = "https://www.acrm.pl";
const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL;
const TIKTOK_URL = import.meta.env.VITE_TIKTOK_URL;
const YOUTUBE_URL = import.meta.env.VITE_YOUTUBE_URL;
const LogoPng = `${BASE_URL}/logo-dark.png`;

const AVAILABILITY_MAP: Record<ProductStatus, string> = {
  published: "https://schema.org/InStock",
  in_checkout: "https://schema.org/OutOfStock", // Reserved during checkout
  sold: "https://schema.org/SoldOut",
  draft: "https://schema.org/OutOfStock", // Not ready for sale
  return_requested: "https://schema.org/OutOfStock", // Pending return
  returned: "https://schema.org/OutOfStock", // Needs manual review before relisting
};

const GENDER_MAP: Record<Gender, string> = {
  male: "https://schema.org/Male",
  female: "https://schema.org/Female",
  unisex: "Unisex",
};

export function extractTextFromRichText(richText: RichText): string {
  if (!richText) return "";

  try {
    if (typeof richText === "string") return richText;

    const extractText = (node: any): string => {
      if (!node) return "";
      if (typeof node === "string") return node;

      if (Array.isArray(node)) {
        return node.map(extractText).join(" ");
      }

      if (typeof node === "object") {
        if ("text" in node && node.text) return node.text;
        if ("content" in node && node.content) {
          return extractText(node.content);
        }
        if ("children" in node && node.children) {
          return extractText(node.children);
        }
      }

      return "";
    };

    return extractText(richText).trim();
  } catch (e) {
    console.error("Error extracting text from RichText:", e);
    return "";
  }
}

function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    address: {
      "@type": "PostalAddress",
      addressCountry: "PL",
      addressLocality: COMPANY_INFO.city,
      postalCode: COMPANY_INFO.postalCode,
      streetAddress: COMPANY_INFO.address,
    },
    alternateName: COMPANY_INFO.tradeName,
    contactPoint: {
      "@type": "ContactPoint",
      email: COMPANY_INFO.email,
      telephone: COMPANY_INFO.phone,
    },
    description:
      "ACRM oferuje markową odzież z second-handu w przystępnych cenach. Dickies, Nike, Carhartt i więcej. Darmowa dostawa, realizacja w 24h, zwroty do 14 dni.",
    email: COMPANY_INFO.email,
    foundingDate: "2025-09-09",
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",

      // Where policy applies and where items are returned to
      applicableCountry: "PL",
      returnPolicyCountry: "PL",

      // Link to the actual policy page
      merchantReturnLink: "https://www.acrm.pl/odstapienie-od-umowy",

      // 14-day finite window
      returnPolicyCategory:
        "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,

      // Mail only — matches store policy (postal address given, no drop-off mentioned)
      returnMethod: "https://schema.org/ReturnByMail",

      // Customer pays return shipping
      returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",

      // Customer creates their own label
      returnLabelSource: "https://schema.org/ReturnLabelCustomerResponsibility",

      // Full monetary refund — matches policy (all payments returned)
      refundType: "https://schema.org/FullRefund",

      // Used condition — matches product type (used clothing)
      itemCondition: "https://schema.org/UsedCondition",

      // Customer remorse (non-defective) — explicitly covered by the withdrawal page
      customerRemorseReturnFees:
        "https://schema.org/ReturnFeesCustomerResponsibility",
      customerRemorseReturnLabelSource:
        "https://schema.org/ReturnLabelCustomerResponsibility",
    },
    hasShippingService: [
      {
        "@type": "ShippingService",
        name: "Dostawa InPost do najbliższego punktu InPost",
        fulfillmentType: "https://schema.org/FulfillmentTypeCollectionPoint",
        handlingTime: {
          "@type": "ServicePeriod",
          businessDays: [
            "https://schema.org/Monday",
            "https://schema.org/Tuesday",
            "https://schema.org/Wednesday",
            "https://schema.org/Thursday",
            "https://schema.org/Friday",
          ],
          // 22.00 standard warsaw time
          cutOffTime: "22:00:00",
          duration: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d",
          },
        },
        shippingConditions: [
          {
            "@type": "ShippingConditions",
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "PL",
            },
            shippingOrigin: {
              "@type": "DefinedRegion",
              addressCountry: "PL",
            },
            shippingRate: {
              "@type": "MonetaryAmount",
              value: "0",
              currency: "PLN",
            },
            transitTime: {
              "@type": "ServicePeriod",
              businessDays: [
                "https://schema.org/Monday",
                "https://schema.org/Tuesday",
                "https://schema.org/Wednesday",
                "https://schema.org/Thursday",
                "https://schema.org/Friday",
              ],
              duration: {
                "@type": "QuantitativeValue",
                minValue: 0,
                maxValue: 2,
                unitCode: "d",
              },
            },
          },
        ],
      },
      {
        "@type": "ShippingService",
        name: "Dostawa InPost do podanego adresu",
        fulfillmentType: "https://schema.org/FulfillmentTypeDelivery",
        handlingTime: {
          "@type": "ServicePeriod",
          businessDays: [
            "https://schema.org/Monday",
            "https://schema.org/Tuesday",
            "https://schema.org/Wednesday",
            "https://schema.org/Thursday",
            "https://schema.org/Friday",
          ],
          // 22.00 standard warsaw time
          cutOffTime: "22:00:00",
          duration: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d",
          },
        },
        shippingConditions: [
          {
            "@type": "ShippingConditions",
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "PL",
            },
            shippingOrigin: {
              "@type": "DefinedRegion",
              addressCountry: "PL",
            },
            shippingRate: {
              "@type": "MonetaryAmount",
              value: "0",
              currency: "PLN",
            },
            transitTime: {
              "@type": "ServicePeriod",
              businessDays: [
                "https://schema.org/Monday",
                "https://schema.org/Tuesday",
                "https://schema.org/Wednesday",
                "https://schema.org/Thursday",
                "https://schema.org/Friday",
              ],
              duration: {
                "@type": "QuantitativeValue",
                minValue: 0,
                maxValue: 2,
                unitCode: "d",
              },
            },
          },
        ],
      },
    ],
    legalName: COMPANY_INFO.legalName,
    logo: LogoPng,
    name: COMPANY_INFO.tradeName,
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: 0,
    },
    sameAs: [INSTAGRAM_URL, TIKTOK_URL, YOUTUBE_URL],
    taxID: COMPANY_INFO.nip,
    vatID: `PL${COMPANY_INFO.nip}`,
  };
}

type BreadcrumbListItem = {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
};

type BreadcrumbList = {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbListItem[];
};

function generateBreadcrumbListStructuredData(
  category: DBQueryResult<
    "categories",
    {
      columns: {
        path: true;
      };
    }
  >
): BreadcrumbList {
  const itemListElement: BreadcrumbListItem[] = [];

  // Add each category in the path
  for (let i = 0; i < category.path.length; i++) {
    const segment = category.path[i];
    const slugPath = category.path
      .slice(0, i + 1)
      .map((p) => p.slug)
      .join("/");

    itemListElement.push({
      "@type": "ListItem",
      position: i + 1, // +2 because Home is position 1
      name: segment.name,
      item: `${BASE_URL}/kategorie/${slugPath}`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

function generatePieceStructuredData(
  piece: DBQueryResult<
    "pieces",
    {
      columns: {
        id: true;
        name: true;
        status: true;
        gender: true;
        slug: true;
        priceInGrosz: true;
        description: true;
        color: true;
        material: true;
        pattern: true;
      };
      with: {
        images: {
          columns: {
            url: true;
          };
        };
        brand: {
          columns: {
            name: true;
          };
        };
        size: {
          columns: {
            name: true;
          };
        };
        discount: {
          columns: {
            amountOffInGrosz: true;
            percentOff: true;
          };
        };
      };
    }
  >
) {
  const pricing = calculatePiecePriceDisplayData(piece);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: piece.name,
    image: piece.images.map((img) => img.url),
    offers: {
      "@type": "Offer",
      price: pricing.finalPrice,
      priceCurrency: "PLN",
      availability:
        AVAILABILITY_MAP[piece.status] || "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/UsedCondition",
      url: `${BASE_URL}/ubrania/${piece.slug}`,
      ...(pricing.hasDiscount
        ? {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              priceType: "https://schema.org/StrikethroughPrice",
              price: pricing.originalPrice,
              priceCurrency: "PLN",
            },
          }
        : {}),
    },
    ...(piece.brand
      ? {
          brand: {
            "@type": "Brand",
            name: piece.brand.name,
          },
        }
      : {}),
    audience: {
      "@type": "PeopleAudience",
      suggestedGender: GENDER_MAP[piece.gender] || "Unisex",
      suggestedMinAge: 5.0,
    },
    ...(piece.color ? { color: piece.color } : {}),
    ...(piece.material ? { material: piece.material } : {}),
    ...(piece.pattern ? { pattern: piece.pattern } : {}),
    ...(piece.description
      ? { description: extractTextFromRichText(piece.description) }
      : {}),
    ...(piece.size
      ? {
          size: {
            "@type": "SizeSpecification",
            name: piece.size.name,
            //sizeGroup:
            sizeSystem: "https://schema.org/WearableSizeSystemEurope",
          },
        }
      : {}),
    sku: piece.id,
  };
}

/**
 * Generates Schema.org Product structured data for a product
 */
function generateProductStructuredData(
  product: DBQueryResult<
    "products",
    {
      columns: {
        id: true;
        name: true;
        status: true;
        slug: true;
        description: true;
      };
      with: {
        images: {
          columns: {
            url: true;
          };
        };
        pieces: {
          with: {
            discount: {
              columns: {
                amountOffInGrosz: true;
                percentOff: true;
              };
            };
            images: {
              columns: {
                url: true;
              };
            };
            brand: {
              columns: {
                name: true;
              };
            };
            size: {
              columns: {
                name: true;
              };
            };
          };
        };
        discount: {
          columns: {
            amountOffInGrosz: true;
            percentOff: true;
          };
        };
      };
    }
  >
) {
  const pricing = calculateProductPriceDisplayData(product);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => img.url),
    offers: {
      "@type": "Offer",
      price: pricing.finalPrice,
      priceCurrency: "PLN",
      availability:
        AVAILABILITY_MAP[product.status] || "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/UsedCondition",
      url: `${BASE_URL}/projekty/${product.slug}`,
      ...(pricing.hasDiscount
        ? {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              priceType: "https://schema.org/StrikethroughPrice",
              price: pricing.originalPrice,
              priceCurrency: "PLN",
            },
          }
        : {}),
    },
    ...(product.pieces?.[0]?.brand
      ? {
          brand: {
            "@type": "Brand",
            name: product.pieces[0].brand.name,
          },
        }
      : {}),
    audience: {
      "@type": "PeopleAudience",
      suggestedGender: GENDER_MAP[product.pieces?.[0]?.gender || "unisex"],
      suggestedMinAge: 5.0,
    },
    description: extractTextFromRichText(product.description),
    sku: product.id,
  };
}

export {
  generateOrganizationStructuredData,
  generateBreadcrumbListStructuredData,
  generatePieceStructuredData,
  generateProductStructuredData,
};
