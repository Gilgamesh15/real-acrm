import {
  type ColumnDef,
  type RowData,
  useReactTable,
} from "@tanstack/react-table";
import type { TableMeta, Table as TableType } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { createContext, useContext, useMemo, useState } from "react";

import { useDataTableFilters } from "~/components/shared/data-table-filter";
import {
  type Column,
  type ColumnConfig,
  type DataTableFilterActions,
  type FiltersState,
} from "~/components/shared/data-table-filter/core/types";
import {
  createTSTColumns,
  createTSTFilters,
} from "~/components/shared/data-table-filter/integrations/tanstack-table";

type DataTableContextType<TData extends RowData = RowData> = {
  table: TableType<TData>;
  columns: Column<TData>[];
  filters: FiltersState;
  actions: DataTableFilterActions;
  columnOrder: string[];
  setColumnOrder: (columnOrder: string[]) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DataTableContext = createContext<any>(null);

export const useDataTable = <
  TData extends RowData,
>(): DataTableContextType<TData> => {
  const context = useContext(DataTableContext);

  if (!context) {
    throw new Error(
      "useDataTable must be used within a DataTableContextProvider"
    );
  }

  return context as DataTableContextType<TData>;
};

interface DataTableProviderProps<
  TData extends RowData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>>,
> {
  children: React.ReactNode;
  columns: ColumnDef<TData>[];
  data: TData[];
  columnsConfig: TColumns;
  meta?: TableMeta<TData>;
}

const DataTableProvider = <
  TData extends RowData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>>,
>({
  children,
  columns: originalColumns,
  columnsConfig,
  data,
  meta,
}: DataTableProviderProps<TData, TColumns>) => {
  const {
    columns: filtersColumns,
    filters: filtersFilters,
    actions,
  } = useDataTableFilters({
    strategy: "client",
    data,
    columnsConfig,
  });

  const columns = useMemo(
    () =>
      createTSTColumns({
        columns: originalColumns,
        configs: filtersColumns,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtersColumns]
  );

  const filters = useMemo(
    () => createTSTFilters(filtersFilters),
    [filtersFilters]
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string)
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    columnResizeMode: "onChange",
    enableSortingRemoval: false,
    onColumnOrderChange: setColumnOrder,
    state: {
      columnFilters: filters,
      sorting,
      columnVisibility,
      rowSelection,
      columnOrder,
    },
    meta,
  });

  return (
    <DataTableContext.Provider
      value={
        {
          table,
          columns: filtersColumns,
          filters: filtersFilters,
          actions,
          columnOrder,
          setColumnOrder,
        } satisfies DataTableContextType<TData>
      }
    >
      {children}
    </DataTableContext.Provider>
  );
};

export { DataTableProvider };
