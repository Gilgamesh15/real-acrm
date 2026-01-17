import { flexRender } from "@tanstack/react-table";
import type { Column } from "@tanstack/react-table";
import {
  ArrowLeftFromLineIcon,
  ArrowRightFromLineIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
  EyeOffIcon,
  GripVerticalIcon,
  PinOffIcon,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { cn } from "~/lib/utils";

import {
  ColumnDragHandle,
  DraggableColumn,
  DraggableColumnsProvider,
} from "../column-sort";
import { useDataTable } from "./data-table-provider";

const DataTableContent = <TData,>({ className }: { className?: string }) => {
  const { table, columns, columnOrder, setColumnOrder } = useDataTable<TData>();

  return (
    <DraggableColumnsProvider
      columnOrder={columnOrder}
      setColumnOrder={setColumnOrder}
    >
      <div className="grid grid-cols-1 w-full overflow-x-auto">
        <Table
          className={cn(
            "w-full",
            table.getState().columnSizingInfo.isResizingColumn ||
              Object.keys(table.getState().columnSizing).length > 0
              ? "table-fixed"
              : "table-auto",
            className
          )}
          style={{
            width: table.getCenterTotalSize(),
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <ContextMenu key={header.column.id}>
                    <DraggableColumn column={header.column}>
                      <ContextMenuTrigger asChild>
                        <TableHead
                          className={cn(
                            "group/head select-none relative bg-muted/50",
                            header.column.getIsPinned() &&
                              "backdrop-blur-xs shadow-sm bg-muted/90"
                          )}
                          colSpan={header.colSpan}
                          style={{
                            width: header.getSize(),
                            ...getPinningStyles(header.column),
                          }}
                        >
                          <div className="flex items-center justify-between min-w-16">
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              {!header.isPlaceholder &&
                                !header.column.getIsPinned() && (
                                  <ColumnDragHandle column={header.column}>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      className="cursor-grab active:cursor-grabbing hover:bg-transparent bg-transparent shrink-0"
                                    >
                                      <GripVerticalIcon className="opacity-60" />
                                    </Button>
                                  </ColumnDragHandle>
                                )}
                              <span className="truncate min-w-0">
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </span>
                            </div>
                            <div className="flex items-center shrink-0">
                              {header.column.getCanSort() && (
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  className="cursor-pointer hover:bg-transparent bg-transparent"
                                  onClick={() =>
                                    header.column.toggleSorting(
                                      header.column.getIsSorted() === "asc"
                                    )
                                  }
                                >
                                  {header.column.getIsSorted() === "asc" ? (
                                    <ChevronUpIcon className="opacity-60" />
                                  ) : header.column.getIsSorted() === "desc" ? (
                                    <ChevronDownIcon className="opacity-60" />
                                  ) : (
                                    <ChevronsUpDownIcon className="opacity-60" />
                                  )}
                                </Button>
                              )}
                              {!header.isPlaceholder &&
                                header.column.getCanPin() &&
                                header.column.getIsPinned() && (
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    onClick={() => header.column.pin(false)}
                                    className="cursor-pointer hover:bg-transparent bg-transparent"
                                  >
                                    <PinOffIcon className="opacity-60" />
                                  </Button>
                                )}
                            </div>
                          </div>
                          {header.column.getCanResize() && (
                            <div
                              onDoubleClick={() => header.column.resetSize()}
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className="group-last/head:hidden absolute top-0 -right-4 h-full w-6 cursor-col-resize select-none touch-none z-10 before:absolute before:w-[1.5px] before:inset-y-0 before:bg-border before:translate-x-px opacity-0 hover:opacity-100"
                            />
                          )}
                        </TableHead>
                      </ContextMenuTrigger>
                    </DraggableColumn>
                    <ContextMenuContent>
                      <ContextMenuItem>
                        <EyeOffIcon />
                        Hide
                      </ContextMenuItem>
                      {header.column.getCanPin() && (
                        <>
                          <ContextMenuItem
                            onClick={() => header.column.pin("left")}
                          >
                            <ArrowLeftFromLineIcon />
                            Pin to left
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={() => header.column.pin("right")}
                          >
                            <ArrowRightFromLineIcon />
                            Pin to right
                          </ContextMenuItem>
                        </>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <DraggableColumn key={cell.column.id} column={cell.column}>
                      <TableCell
                        className={cn(
                          "overflow-hidden truncate",
                          cell.column.getIsPinned() &&
                            "bg-background/90 backdrop-blur-xs shadow-sm"
                        )}
                        style={{ ...getPinningStyles(cell.column) }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    </DraggableColumn>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DraggableColumnsProvider>
  );
};

export { DataTableContent };

const getPinningStyles = <TData,>(
  column: Column<TData>
): React.CSSProperties => {
  const isPinned = column.getIsPinned();

  return {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    position: isPinned ? "sticky" : "relative",
    zIndex: isPinned ? 1 : 0,
  };
};
