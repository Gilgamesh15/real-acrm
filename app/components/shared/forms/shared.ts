import { z } from "zod";

const NameFormSchema = z
  .string({ error: "Nazwa jest wymagana" })
  .min(2, "Nazwa musi mieć co najmniej 2 znaki")
  .max(100, "Nazwa nie może przekraczać 100 znaków");

type NameFormType = z.infer<typeof NameFormSchema>;

export { NameFormSchema, type NameFormType };

const ImageFormSchema = z.object({
  alt: z.string(),
  url: z.url(),
  filename: z.string(),
  mimeType: z.string(),
  filesize: z.int().positive(),
  width: z.int().positive(),
  height: z.int().positive(),
});

type ImageFormType = z.infer<typeof ImageFormSchema>;

const ManyImagesFormSchema = z.array(
  ImageFormSchema.extend({
    displayOrder: z.int().positive(),
  })
);

type ManyImagesFormType = z.infer<typeof ManyImagesFormSchema>;

export {
  ImageFormSchema,
  type ImageFormType,
  ManyImagesFormSchema,
  type ManyImagesFormType,
};
