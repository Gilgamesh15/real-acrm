import { DataTableColumnHeader } from "./columns";
import {
  DataTableColumnToggle,
  DataTableContent,
  DataTableFilter,
  DataTablePagination,
  DataTableProvider,
  DataTableRoot,
} from "./table";
import { DataTableFilterType } from "./table/data-table-filter";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    filterType?: DataTableFilterType;
    options?: Array<{ value: string; label: string }>;
    metaHeader?: string;
  }
}

export {
  DataTableColumnHeader,
  DataTableColumnToggle,
  DataTableContent,
  DataTableFilter,
  DataTableProvider,
  DataTableRoot,
  DataTablePagination,
};
