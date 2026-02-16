import { categoriesContract } from "./categories/api";
import { piecesContract } from "./pieces/api";
import { productsContract } from "./products/api";

export const rootContract = {
  categories: categoriesContract,
  products: productsContract,
  pieces: piecesContract,
};
