import { useLocation, useSearchParams } from "react-router";

import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Pagination as PaginationUI,
} from "~/components/ui/pagination";

import { useFilters } from "../filter-provider";

export function FilterPagination({ totalPages }: { totalPages: number }) {
  const { filters } = useFilters();
  const currentPage = filters.page;
  const [searchParams] = useSearchParams();
  const pathname = useLocation().pathname;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <PaginationUI>
      <PaginationContent>
        {/* 1. Previous button if not on first page */}
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={createPageUrl(currentPage - 1)} />
          </PaginationItem>
        )}

        {/* 2. First page if not on first page */}
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationLink href={createPageUrl(1)}>1</PaginationLink>
          </PaginationItem>
        )}

        {/* 3. Ellipsis if gap between first page and previous page */}
        {currentPage - 1 > 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* 4. Previous page number if not on first page */}
        {currentPage - 1 > 1 && (
          <PaginationItem>
            <PaginationLink href={createPageUrl(currentPage - 1)}>
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* 5. Current page (always shown) */}
        <PaginationItem>
          <PaginationLink isActive href={createPageUrl(currentPage)}>
            {currentPage}
          </PaginationLink>
        </PaginationItem>

        {/* 6. Next page number if not on last page */}
        {currentPage + 1 < totalPages && (
          <PaginationItem>
            <PaginationLink href={createPageUrl(currentPage + 1)}>
              {currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* 7. Ellipsis if gap between next page and last page */}
        {currentPage + 1 < totalPages - 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* 8. Last page if not on last page */}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationLink href={createPageUrl(totalPages)}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* 9. Next button if not on last page */}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext href={createPageUrl(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </PaginationUI>
  );
}
