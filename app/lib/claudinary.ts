import { Cloudinary } from "@cloudinary/url-gen";

export const cld = new Cloudinary({
  cloud: { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME },
});

export function extractPublicId(urlOrId: string): string {
  if (!urlOrId.startsWith("http")) return urlOrId;
  const match = urlOrId.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match?.[1] || urlOrId;
}
