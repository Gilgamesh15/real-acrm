import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slot } from "@radix-ui/react-slot";
import type { Column, RowData } from "@tanstack/react-table";
import type { CSSProperties, ComponentProps } from "react";

export const DraggableColumn = <TData extends RowData, TValue = unknown>({
  column,
  ...props
}: {
  column: Column<TData, TValue>;
} & ComponentProps<typeof Slot>) => {
  const { isDragging, setNodeRef, transform, transition } = useSortable({
    id: column.id,
    resizeObserverConfig: {},
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition,
    whiteSpace: "nowrap",
    width: column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return <Slot ref={setNodeRef} style={style} {...props} />;
};
