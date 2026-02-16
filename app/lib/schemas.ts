import z from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const PASSWORD_CONDITIONS = [
  [
    (arg) => arg.length >= PASSWORD_MIN_LENGTH,
    "Hasło musi mieć co najmniej 8 znaków",
  ],
  [
    (arg) => /[A-Z]/.test(arg),
    "Hasło musi zawierać co najmniej jedną dużą literę",
  ],
  [
    (arg) => /[a-z]/.test(arg),
    "Hasło musi zawierać co najmniej jedną małą literę",
  ],
  [(arg) => /\d/.test(arg), "Hasło musi zawierać co najmniej jedną cyfrę"],
  [
    (arg) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(arg),
    "Hasło musi zawierać co najmniej jeden znak specjalny",
  ],
  [
    (arg) => arg.length <= PASSWORD_MAX_LENGTH,
    "Hasło nie może być dłuższe niż 128 znaków",
  ],
] satisfies Parameters<z.ZodString["refine"]>[];

export const PASSWORD_CONDITIONS_COUNT = PASSWORD_CONDITIONS.length;

export const PasswordSchema = PASSWORD_CONDITIONS.reduce(
  (acc, [condition, message]) => {
    return acc.refine(condition, message);
  },
  z.string()
);

export const ImageFormSchema = z.object({
  id: z.string({ message: "ID musi być tekstem" }).optional(),
  alt: z
    .string({ message: "Tekst alternatywny musi być tekstem" })
    .min(1, "Tekst alternatywny jest wymagany"),
  url: z
    .string({ message: "URL musi być tekstem" })
    .url("Nieprawidłowy format adresu URL"),
  filename: z
    .string({ message: "Nazwa pliku musi być tekstem" })
    .min(1, "Nazwa pliku jest wymagana"),
  mimeType: z
    .string({ message: "Typ MIME musi być tekstem" })
    .min(1, "Typ MIME jest wymagany"),
  filesize: z
    .number({ message: "Rozmiar pliku musi być liczbą" })
    .int("Rozmiar pliku musi być liczbą całkowitą")
    .positive("Rozmiar pliku musi być większy od 0"),
  width: z
    .number({ message: "Szerokość musi być liczbą" })
    .int("Szerokość musi być liczbą całkowitą")
    .positive("Szerokość musi być większa od 0"),
  height: z
    .number({ message: "Wysokość musi być liczbą" })
    .int("Wysokość musi być liczbą całkowitą")
    .positive("Wysokość musi być większa od 0"),
});

export const ImagesFormSchema = z.array(
  ImageFormSchema.extend({
    displayOrder: z
      .number({ message: "Kolejność wyświetlania musi być liczbą" })
      .int("Kolejność wyświetlania musi być liczbą całkowitą"),
  }),
  { message: "Lista zdjęć musi być tablicą" }
);

const CategoryFormSchema = z.object({
  name: z
    .string({ message: "Nazwa kategorii musi być tekstem" })
    .min(1, "Nazwa kategorii jest wymagana")
    .max(100, "Nazwa kategorii nie może przekraczać 100 znaków"),
  parentId: z.string().optional(),
  image: ImageFormSchema.optional(),
  featuredOrder: z
    .number({ message: "Kolejność wyróżnienia musi być liczbą" })
    .int("Kolejność wyróżnienia musi być liczbą całkowitą")
    .optional(),
});

type CategoryFormSchemaType = z.infer<typeof CategoryFormSchema>;

export { CategoryFormSchema, type CategoryFormSchemaType };

const SizeGroupFormSchema = z.object({
  name: z
    .string({ message: "Nazwa grupy rozmiarów musi być tekstem" })
    .min(1, "Nazwa grupy rozmiarów jest wymagana")
    .max(100, "Nazwa grupy rozmiarów nie może przekraczać 100 znaków"),
  displayOrder: z
    .number({ message: "Kolejność wyświetlania musi być liczbą" })
    .int("Kolejność wyświetlania musi być liczbą całkowitą")
    .optional(),
});

type SizeGroupFormSchemaType = z.infer<typeof SizeGroupFormSchema>;

export { SizeGroupFormSchema, type SizeGroupFormSchemaType };

const SizeFormSchema = z.object({
  name: z
    .string({ message: "Nazwa rozmiaru musi być tekstem" })
    .min(1, "Nazwa rozmiaru jest wymagana")
    .max(50, "Nazwa rozmiaru nie może przekraczać 50 znaków"),
  groupId: z
    .string({ message: "ID grupy rozmiarów musi być tekstem" })
    .optional(),
});

type SizeFormSchemaType = z.infer<typeof SizeFormSchema>;

export { SizeFormSchema, type SizeFormSchemaType };

const BrandFormSchema = z.object({
  name: z
    .string({ message: "Nazwa marki musi być tekstem" })
    .min(1, "Nazwa marki jest wymagana")
    .max(100, "Nazwa marki nie może przekraczać 100 znaków"),
});

type BrandFormSchemaType = z.infer<typeof BrandFormSchema>;

export { BrandFormSchema, type BrandFormSchemaType };

const BrandGroupFormSchema = z.object({
  name: z
    .string({ message: "Nazwa grupy marek musi być tekstem" })
    .min(1, "Nazwa grupy marek jest wymagana")
    .max(100, "Nazwa grupy marek nie może przekraczać 100 znaków"),
  displayOrder: z
    .number({ message: "Kolejność wyświetlania musi być liczbą" })
    .int("Kolejność wyświetlania musi być liczbą całkowitą")
    .optional(),
});

type BrandGroupFormSchemaType = z.infer<typeof BrandGroupFormSchema>;

export { BrandGroupFormSchema, type BrandGroupFormSchemaType };

const ProductFormSchema = z.object({
  name: z
    .string({ message: "Nazwa produktu musi być tekstem" })
    .min(1, "Nazwa produktu jest wymagana")
    .max(200, "Nazwa produktu nie może przekraczać 200 znaków"),
  keywords: z
    .array(z.string({ message: "Słowo kluczowe musi być tekstem" }))
    .min(1, "Wymagane jest co najmniej jedno słowo kluczowe"),
  description: z.any(),
  images: ImagesFormSchema,
  homeFeaturedOrder: z
    .number({
      message: "Kolejność wyświetlania na stronie głównej musi być liczbą",
    })
    .int("Kolejność wyświetlania na stronie głównej musi być liczbą całkowitą")
    .optional(),
  piecesIds: z
    .array(
      z
        .string({ message: "ID elementu musi być tekstem" })
        .min(1, "ID elementu nie może być puste"),
      { message: "Lista elementów musi być tablicą" }
    )
    .min(1, "Wymagany jest co najmniej jeden element produktu"),
});

type ProductFormSchemaType = z.infer<typeof ProductFormSchema>;

export { ProductFormSchema, type ProductFormSchemaType };

const TagFormSchema = z.object({
  name: z
    .string({ message: "Nazwa tagu musi być tekstem" })
    .min(1, "Nazwa tagu jest wymagana")
    .max(100, "Nazwa tagu nie może przekraczać 100 znaków"),
  image: ImageFormSchema.optional(),
  featuredOrder: z
    .number({
      message: "Kolejność wyświetlania na stronie głównej musi być liczbą",
    })
    .int("Kolejność wyświetlania na stronie głównej musi być liczbą całkowitą")
    .optional(),
});

type TagFormSchemaType = z.infer<typeof TagFormSchema>;

export { TagFormSchema, type TagFormSchemaType };

const MeasurementsFormSchema = z.array(
  z.object({
    id: z.string({ message: "ID pomiaru musi być tekstem" }).optional(),
    name: z
      .string({ message: "Nazwa pomiaru musi być tekstem" })
      .min(1, "Nazwa pomiaru jest wymagana")
      .max(100, "Nazwa pomiaru nie może przekraczać 100 znaków"),
    value: z
      .number({ message: "Wartość pomiaru musi być liczbą" })
      .positive("Wartość pomiaru musi być większa od 0"),
    unit: z
      .string({ message: "Jednostka pomiaru musi być tekstem" })
      .min(1, "Jednostka pomiaru jest wymagana")
      .max(20, "Jednostka nie może przekraczać 20 znaków")
      .optional(),
  }),
  { message: "Pomiary muszą być tablicą" }
);

type MeasurementsFormSchemaType = z.infer<typeof MeasurementsFormSchema>;

export { MeasurementsFormSchema, type MeasurementsFormSchemaType };

const PieceFormSchema = z.object({
  name: z
    .string({ message: "Nazwa elementu musi być tekstem" })
    .min(1, "Nazwa elementu jest wymagana")
    .max(200, "Nazwa elementu nie może przekraczać 200 znaków"),
  gender: z.string({ message: "Płeć musi być tekstem" }).refine((value) => {
    return ["female", "male", "unisex"].includes(value);
  }, "Płeć musi być jedną z: female, male, unisex"),
  productDisplayOrder: z
    .number({ message: "Kolejność wyświetlania musi być liczbą" })
    .int("Kolejność wyświetlania musi być liczbą całkowitą")
    .optional(),
  price: z
    .number({ message: "Cena musi być liczbą" })
    .refine((value) => Number.isInteger(value * 100), {
      message: "Cena nie może mieć więcej niż 2 miejsca po przecinku",
    }),
  keywords: z
    .array(z.string({ message: "Słowo kluczowe musi być tekstem" }))
    .min(1, "Wymagane jest co najmniej jedno słowo kluczowe"),
  brandId: z
    .string({ message: "ID marki musi być tekstem" })
    .min(1, "Marka jest wymagana"),
  sizeId: z
    .string({ message: "ID rozmiaru musi być tekstem" })
    .min(1, "Rozmiar jest wymagany"),
  categoryId: z
    .string({ message: "ID kategorii musi być tekstem" })
    .min(1, "Kategoria jest wymagana")
    .optional(),
  images: ImagesFormSchema,
  measurements: MeasurementsFormSchema,
  tagsIds: z.array(
    z
      .string({ message: "ID tagu musi być tekstem" })
      .min(1, "ID tagu nie może być puste"),
    { message: "Lista tagów musi być tablicą" }
  ),
  homeFeaturedOrder: z
    .number({
      message: "Kolejność wyświetlania na stronie głównej musi być liczbą",
    })
    .int("Kolejność wyświetlania na stronie głównej musi być liczbą całkowitą")
    .optional(),
});

type PieceFormSchemaType = z.infer<typeof PieceFormSchema>;

export { PieceFormSchema, type PieceFormSchemaType };

const FeaturedProductsFormSchema = z.array(
  z.object({
    id: z
      .string({ message: "ID produktu musi być tekstem" })
      .min(1, "ID produktu jest wymagane"),
    featuredOrder: z
      .number({ message: "Kolejność wyróżnienia musi być liczbą" })
      .int("Kolejność wyróżnienia musi być liczbą całkowitą"),
  }),
  { message: "Wyróżnione produkty muszą być tablicą" }
);

type FeaturedProductsFormSchemaType = z.infer<
  typeof FeaturedProductsFormSchema
>;

const TopFeaturedProductsFormSchema = z.array(
  z.object({
    id: z
      .string({ message: "ID produktu musi być tekstem" })
      .min(1, "ID produktu jest wymagane"),
    featuredOrder: z
      .number({ message: "Kolejność wyróżnienia musi być liczbą" })
      .int("Kolejność wyróżnienia musi być liczbą całkowitą"),
  }),
  { message: "Wyróżnione produkty muszą być tablicą" }
);

type TopFeaturedProductsFormSchemaType = z.infer<
  typeof TopFeaturedProductsFormSchema
>;

const TopFeaturedPiecesFormSchema = z.array(
  z.object({
    id: z
      .string({ message: "ID elementu musi być tekstem" })
      .min(1, "ID elementu jest wymagane"),
    featuredOrder: z
      .number({ message: "Kolejność wyróżnienia musi być liczbą" })
      .int("Kolejność wyróżnienia musi być liczbą całkowitą"),
  }),
  { message: "Wyróżnione elementy muszą być tablicą" }
);

type TopFeaturedPiecesFormSchemaType = z.infer<
  typeof TopFeaturedPiecesFormSchema
>;

export {
  TopFeaturedProductsFormSchema,
  type TopFeaturedProductsFormSchemaType,
};
export { TopFeaturedPiecesFormSchema, type TopFeaturedPiecesFormSchemaType };

export { FeaturedProductsFormSchema, type FeaturedProductsFormSchemaType };

const CreateOrderSchema = z
  .object({
    pieces: z.array(
      z.object({
        id: z.string({ message: "ID elementu musi być tekstem" }),
        productId: z
          .string({ message: "ID produktu musi być tekstem" })
          .optional(),
      })
    ),
  })
  .and(
    z.discriminatedUnion("deliveryMethod", [
      z.object({
        deliveryMethod: z.literal("locker"),
        lockerCode: z.string({ message: "Kod sejfowy musi być tekstem" }),
        saveLocker: z
          .boolean({ message: "Czy zapisać sejf? musi być boolean" })
          .optional(),
      }),
      z.object({
        deliveryMethod: z.literal("courier"),
      }),
    ])
  );

type CreateOrderSchemaType = z.infer<typeof CreateOrderSchema>;

export { CreateOrderSchema, type CreateOrderSchemaType };

const DiscountFormSchema = z
  .object({
    name: z
      .string({ message: "Nazwa musi być tekstem" })
      .min(1, "Nazwa jest wymagana")
      .max(100, "Nazwa nie może przekraczać 100 znaków"),
    discountType: z.enum(["percentage", "fixed"], {
      message: "Wybierz typ zniżki",
    }),
    percentOff: z
      .number({ message: "Procent musi być liczbą" })
      .int("Procent musi być liczbą całkowitą")
      .min(1, "Procent musi być co najmniej 1")
      .max(100, "Procent nie może przekraczać 100")
      .optional(),
    amountOffInGrosz: z
      .number({ message: "Kwota musi być liczbą" })
      .int("Kwota musi być liczbą całkowitą")
      .min(1, "Kwota musi być większa od 0")
      .optional(),
    productIds: z.array(z.string({ message: "ID produktu musi być tekstem" })),
    pieceIds: z.array(z.string({ message: "ID elementu musi być tekstem" })),
  })
  .refine(
    (data) => {
      if (data.discountType === "percentage") {
        return typeof data.percentOff === "number";
      }
      if (data.discountType === "fixed") {
        return typeof data.amountOffInGrosz === "number";
      }
      return false;
    },
    {
      message:
        "Musisz podać wartość zniżki odpowiednią dla wybranego typu zniżki",
      path: ["discountType"],
    }
  );

type DiscountFormSchemaType = z.infer<typeof DiscountFormSchema>;

export { DiscountFormSchema, type DiscountFormSchemaType };

const CouponFormSchema = z
  .object({
    amountOffInGrosz: z
      .number({ message: "Kwota musi być liczbą" })
      .int("Kwota musi być liczbą całkowitą")
      .min(1, "Kwota musi być większa od 0")
      .optional(),
    maxUsages: z
      .number({ message: "Maksymalna liczba użyć musi być liczbą" })
      .int("Maksymalna liczba użyć musi być liczbą całkowitą")
      .min(1, "Maksymalna liczba użyć musi być większa od 0")
      .optional(),
    name: z
      .string({ message: "Nazwa musi być tekstem" })
      .min(1, "Nazwa jest wymagana")
      .max(100, "Nazwa nie może przekraczać 100 znaków"),
    couponType: z.enum(["percentage", "fixed"], {
      message: "Wybierz typ zniżki",
    }),
    percentOff: z
      .number({ message: "Procent musi być liczbą" })
      .int("Procent musi być liczbą całkowitą")
      .min(1, "Procent musi być co najmniej 1")
      .max(100, "Procent nie może przekraczać 100")
      .optional(),
    usages: z
      .number({ message: "Użyć musi być liczbą" })
      .int("Użyć musi być liczbą całkowitą")
      .min(0, "Użyć musi być większa od 0")
      .optional(),
    productIds: z.array(z.string({ message: "ID produktu musi być tekstem" })),
    pieceIds: z.array(z.string({ message: "ID elementu musi być tekstem" })),
  })
  .refine(
    (data) => {
      if (data.couponType === "percentage") {
        return typeof data.percentOff === "number";
      }
      if (data.couponType === "fixed") {
        return typeof data.amountOffInGrosz === "number";
      }
      return false;
    },
    {
      message:
        "Musisz podać wartość zniżki odpowiednią dla wybranego typu zniżki",
      path: ["couponType"],
    }
  );

type CouponFormSchemaType = z.infer<typeof CouponFormSchema>;

export { CouponFormSchema, type CouponFormSchemaType };

const DiscountCodeFormSchema = z.object({
  code: z
    .string({ message: "Kod musi być tekstem" })
    .min(1, "Kod jest wymagany"),
  redeemableByUserId: z
    .string({ message: "ID użytkownika musi być tekstem" })
    .optional(),
  maxUsages: z
    .number({ message: "Maksymalna liczba użyć musi być liczbą" })
    .int("Maksymalna liczba użyć musi być liczbą całkowitą")
    .min(1, "Maksymalna liczba użyć musi być większa od 0")
    .optional(),
  couponId: z
    .string({ message: "ID kuponu musi być tekstem" })
    .min(1, "ID kuponu jest wymagane"),
  firstTimeTransaction: z
    .boolean({ message: "Czy transakcja pierwsza? musi być boolean" })
    .optional(),
  minimumAmountInGrosz: z
    .number({ message: "Minimalna kwota musi być liczbą" })
    .int("Minimalna kwota musi być liczbą całkowitą")
    .min(1, "Minimalna kwota musi być większa od 0")
    .optional(),
});

type DiscountCodeFormSchemaType = z.infer<typeof DiscountCodeFormSchema>;

export { DiscountCodeFormSchema, type DiscountCodeFormSchemaType };
