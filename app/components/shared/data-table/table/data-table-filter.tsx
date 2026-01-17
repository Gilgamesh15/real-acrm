import { DataTableFilter as BazzaUiDataTableFilter } from "~/components/shared/data-table-filter";

import { useDataTable } from "./data-table-provider";

export enum DataTableFilterType {
  String = "string",
  Select = "select",
}

const DataTableFilter = <TData,>() => {
  const { columns, filters, actions } = useDataTable<TData>();

  return (
    <BazzaUiDataTableFilter
      columns={columns}
      filters={filters}
      actions={actions}
      strategy="client"
    />
  );
};

export { DataTableFilter };
