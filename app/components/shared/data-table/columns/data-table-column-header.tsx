import type { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

import { Button } from "~/components/ui/button";

import { cn } from "~/lib/utils";

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

const DataTableColumnHeader = <TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) => {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const handleSort = () => {
    const currentSort = column.getIsSorted();

    if (currentSort === false) {
      column.toggleSorting(false);
    } else if (currentSort === "asc") {
      column.toggleSorting(true);
    } else if (currentSort === "desc") {
      column.clearSorting();
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        onClick={handleSort}
        disabled={!column.getCanSort()}
        variant="ghost"
        size="sm"
        className="data-[state=open]:bg-accent -ml-3 h-8"
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ChevronDown />
        ) : column.getIsSorted() === "asc" ? (
          <ChevronUp />
        ) : (
          <ChevronsUpDown />
        )}
      </Button>
    </div>
  );
};

export { DataTableColumnHeader };
