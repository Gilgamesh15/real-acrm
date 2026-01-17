import { useDataTable } from "./data-table-provider";

const DataTableSelectIndicator = <TData,>() => {
  const { table } = useDataTable<TData>();

  return (
    <div className="text-muted-foreground flex-1 text-sm">
      {table.getFilteredSelectedRowModel().rows.length} z{" "}
      {table.getFilteredRowModel().rows.length} wierszy wybranych.
    </div>
  );
};
export { DataTableSelectIndicator };
