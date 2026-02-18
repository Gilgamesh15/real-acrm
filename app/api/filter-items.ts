import * as schema from "db/schema";
import { filterService } from "db/services/filter.service";
import { asc } from "drizzle-orm";
import { type LoaderFunctionArgs, data } from "react-router";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { logger } = context;

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const take = parseInt(url.searchParams.get("take") || "10", 10);

  try {
    const results = await filterService.findFiltered(
      search,
      {
        product: {
          with: {
            images: {
              limit: 1,
              orderBy: asc(schema.images.displayOrder),
            },
            discount: true,
            pieces: {
              with: {
                brand: true,
                category: true,
                size: true,
                images: {
                  limit: 1,
                  orderBy: asc(schema.images.displayOrder),
                },
                discount: true,
              },
            },
          },
        },
        piece: {
          with: {
            discount: true,
            category: true,
            brand: true,
            size: true,
            images: {
              limit: 1,
              orderBy: asc(schema.images.displayOrder),
            },
          },
        },
      },
      take
    );

    return data({ results }, { status: 200 });
  } catch (error) {
    logger.error("Failed to filter items", { error });
    throw data({ error: "Failed to filter items" }, { status: 500 });
  }
}
