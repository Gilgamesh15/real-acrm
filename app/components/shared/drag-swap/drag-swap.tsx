import { DragControls, motion, useDragControls } from "framer-motion";
import { GripVerticalIcon } from "lucide-react";
import React from "react";
import { useThrottledCallback } from "use-debounce";

import { Button } from "~/components/ui/button";

import { cn } from "~/lib/utils";

import { getOverlapPercentage } from "./utils";

type DragSwapContextType = {
  values: string[];
  registerCell: (id: string, ref: HTMLDivElement | null) => void;
  onDrag: (e: MouseEvent | TouchEvent | PointerEvent, id: string) => void;
};

const DragSwapContext = React.createContext<DragSwapContextType | null>(null);

const useDragSwapContext = () => {
  const context = React.useContext(DragSwapContext);
  if (!context) {
    throw new Error(
      "useDragSwapContext must be used within a DragSwapContextProvider"
    );
  }
  return context;
};

interface DragSwapContainerProps extends React.ComponentProps<"div"> {
  values: string[];
  onReorder: (items: string[]) => void;
  overlapThreshold?: number;
}

const DragSwapContainer = ({
  values,
  onReorder,
  overlapThreshold = 0.5,
  className,
  ...props
}: DragSwapContainerProps) => {
  const cellsRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  const registerCell = (id: string, ref: HTMLDivElement | null) => {
    if (ref) {
      cellsRefs.current.set(id, ref);
    } else {
      cellsRefs.current.delete(id);
    }
  };

  const swapItems = (fromId: string, toId: string) => {
    const fromIndex = values.findIndex((v) => v === fromId);
    const toIndex = values.findIndex((v) => v === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const newValues = [...values];
    const temp = newValues[fromIndex];
    newValues[fromIndex] = newValues[toIndex];
    newValues[toIndex] = temp;
    onReorder(newValues);
  };

  const onDrag = useThrottledCallback((e, itemId: string) => {
    const draggedRect = (e.target as HTMLElement).getBoundingClientRect();

    let maxOverlap = 0;
    let targetId: string | null = null;

    cellsRefs.current.forEach((cellRef, cellId) => {
      if (cellId === itemId) return; // Skip self
      const cellRect = cellRef.getBoundingClientRect();

      const overlapPercentage = getOverlapPercentage(draggedRect, cellRect);

      if (overlapPercentage > maxOverlap) {
        maxOverlap = overlapPercentage;
        targetId = cellId;
      }
    });

    if (maxOverlap > overlapThreshold && targetId && targetId !== itemId) {
      swapItems(itemId, targetId);
    }
  }, 100);

  return (
    <DragSwapContext.Provider value={{ values, registerCell, onDrag }}>
      <div className={cn("grid gap-2", className)} {...props} />
    </DragSwapContext.Provider>
  );
};

interface DragSwapItemProps extends React.ComponentProps<typeof motion.div> {
  id: string;
}

type DragHandleContextType = DragControls;

const DragHandleContext = React.createContext<DragHandleContextType | null>(
  null
);

const useDragHandleContext = () => {
  const context = React.useContext(DragHandleContext);
  if (!context) {
    throw new Error(
      "useDragHandleContext must be used within a DragHandleContext"
    );
  }
  return context;
};

const DragSwapItem = ({ id, className, ...props }: DragSwapItemProps) => {
  const { registerCell, onDrag } = useDragSwapContext();
  const dragControls = useDragControls();

  return (
    <DragHandleContext.Provider value={dragControls}>
      <div
        ref={(el) => {
          if (el) {
            registerCell(id, el);
          }
        }}
      >
        <motion.div
          key={id}
          layout
          drag
          dragControls={dragControls}
          dragListener={false}
          whileDrag={{
            zIndex: 1000,
          }}
          onDrag={(e) => onDrag(e, id)}
          dragMomentum={false}
          transition={{ power: 0.1, timeConstant: 150 }}
          dragElastic={1}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          className={cn("", className)}
          {...props}
        />
      </div>
    </DragHandleContext.Provider>
  );
};

const DragSwapDragHandle = ({
  className,
  ...props
}: React.ComponentProps<typeof Button>) => {
  const dragControls = useDragHandleContext();

  return (
    <Button
      onPointerDown={(e) => dragControls.start(e)}
      size="icon"
      className={cn("cursor-grab active:cursor-grabbing", className)}
      {...props}
    >
      <GripVerticalIcon />
    </Button>
  );
};

export { DragSwapContainer, DragSwapDragHandle, DragSwapItem };
