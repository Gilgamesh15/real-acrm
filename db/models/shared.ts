import baseSlugify from "slugify";
import z from "zod";

export const NameSchema = z
  .string({ error: "Nazwa musi być tekstem" })
  .min(2, "Nazwa musi być dłuższa niż 2 znaki")
  .max(120, "Nazwa nie może przekraczać 120 znaków");
export const UUIDSchema = z.uuid({ error: "ID musi być tekstem" });
export const URLSchema = z.url({
  error: "URL musi być prawidłowym adresem URL",
});
export const PriceSchema = z
  .number({ error: "Cena musi być liczbą" })
  .nonnegative("Cena musi być większa lub równa 0");
export const SizeSchema = z
  .number({ error: "Rozmiar musi być liczbą" })
  .int("Rozmiar musi być liczbą całkowitą")
  .positive("Rozmiar musi być większy od 0");
export const OrderSchema = z
  .number({ error: "Kolejność musi być liczbą" })
  .int("Kolejność musi być liczbą całkowitą")
  .min(-1, "Kolejność musi być większa lub równa -1");
export const OrderArraySchema = z
  .array(
    z.object({
      slug: z.string({ error: "Slug musi być tekstem" }),
      order: OrderSchema,
    })
  )
  .refine(
    (data) => {
      const nonNegativeCnt = data.filter((item) => item.order >= 0).length;
      for (let i = 0; i < nonNegativeCnt; i++) {
        const found = data.find((item) => item.order === i);
        if (!found) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Kolejność musi być unikalna i ciągła",
    }
  );
export const PaginationSchema = z.object({
  limit: z.coerce.number().optional().default(1000),
  offset: z.coerce.number().optional().default(0),
});

export const SortOrderSchema = z
  .enum(["asc", "desc"])
  .optional()
  .default("desc");

export const slugify = (name: string) =>
  baseSlugify(name, { lower: true, strict: true, locale: "pl" });

export const generateSlug = async (
  name: string,
  existsInDb: (slug: string) => Promise<boolean>
): Promise<string> => {
  let candidateSlug = slugify(name);

  if (!(await existsInDb(candidateSlug))) {
    return candidateSlug;
  }

  let i = 1;
  while (true) {
    candidateSlug = `${slugify(name)}-${i}`;
    if (!(await existsInDb(candidateSlug))) {
      return candidateSlug;
    }
    i++;
  }
};
