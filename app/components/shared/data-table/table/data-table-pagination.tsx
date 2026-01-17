import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "~/components/ui/button";

import { useDataTable } from "./data-table-provider";

const DataTablePagination = <TData,>() => {
  const { table } = useDataTable<TData>();

  return (
    <div className="flex items-center space-x-2 text-sm">
      strona&nbsp;
      <span className="font-medium">
        {table.getState().pagination.pageIndex + 1} z {table.getPageCount()}
      </span>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};
export { DataTablePagination };
