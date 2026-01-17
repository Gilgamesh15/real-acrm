import { useSortable } from "@dnd-kit/sortable";
import { Slot } from "@radix-ui/react-slot";
import type { Column, RowData } from "@tanstack/react-table";
import type { ComponentProps } from "react";

export const ColumnDragHandle = <TData extends RowData, TValue = unknown>({
  column,
  ...props
}: {
  column: Column<TData, TValue>;
} & ComponentProps<typeof Slot>) => {
  const { attributes, listeners } = useSortable({
    id: column.id,
    resizeObserverConfig: {},
  });

  return <Slot {...attributes} {...listeners} {...props} />;
};
