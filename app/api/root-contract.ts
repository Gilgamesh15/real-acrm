import { brandsContract } from "./brands/brands.contract";
import { sizesContract } from "./sizes/sizes.contract";

export const rootContract = {
  brands: brandsContract,
  sizes: sizesContract,
};
