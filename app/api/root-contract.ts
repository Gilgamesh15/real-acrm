import { brandsContract } from "./brands/brands.contract";
import { newsletterContract } from "./newsletter/newsletter.contract";
import { sizesContract } from "./sizes/sizes.contract";

export const rootContract = {
  brands: brandsContract,
  sizes: sizesContract,
  newsletter: newsletterContract,
};
