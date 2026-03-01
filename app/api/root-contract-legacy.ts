import { categoriesContract } from "./categories/api";
import { featuredProductsContract } from "./featured-products/api";
import { piecesContract } from "./pieces/api";
import { productsContract } from "./products/api";

export const rootContract = {
  categories: categoriesContract,
  products: productsContract,
  featuredProducts: featuredProductsContract,
  pieces: piecesContract,
};
