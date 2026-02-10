import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { useEffect } from "react";

import Image from "~/components/ui/image";
import { Section } from "~/components/ui/layout";
import {
  SlideIndicator,
  SlideIndicatorContent,
  SlideIndicatorItem,
  SlideIndicatorNext,
  SlideIndicatorPrev,
} from "~/components/ui/slide-indicator";

import { ImagesDrawerCarousel } from "~/components/features/images-dialog-carousel/images-dialog-carousel";
import { useResponsiveState } from "~/hooks/use-responsive-state";
import { cn } from "~/lib/utils";

export default function ProductImagesCarouselSection({
  images,
}: {
  images: string[];
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const state = useResponsiveState({
    base: {
      slideWidth: 240,
      slideHeight: 350,
      slideOffset1: 75,
      slideOffset2: 65,
      sizeOffset1: 19,
      sizeOffset2: 25,
    },
    sm: {
      slideWidth: 250,
      slideHeight: 370,
      slideOffset1: 64,
      slideOffset2: 65,
      sizeOffset1: 15,
      sizeOffset2: 20,
    },
    md: {
      slideWidth: 260,
      slideHeight: 380,
      slideOffset1: 135,
      slideOffset2: 130,
      sizeOffset1: 23,
      sizeOffset2: 30,
    },
    lg: {
      slideWidth: 255,
      slideHeight: 365,
      slideOffset1: 130,
      slideOffset2: 125,
      sizeOffset1: 30,
      sizeOffset2: 30,
    },
    xl: {
      slideWidth: 250,
      slideHeight: 380,
      slideOffset1: 155,
      slideOffset2: 150,
      sizeOffset1: 22,
      sizeOffset2: 28,
    },
    "2xl": {
      slideWidth: 310,
      slideHeight: 430,
      slideOffset1: 170,
      slideOffset2: 160,
      sizeOffset1: 20,
      sizeOffset2: 30,
    },
  });

  return (
    <>
      <Section centered padding="lg">
        <SwipableCards
          onActiveItemClick={() => {
            setIsDialogOpen(true);
          }}
          items={images}
          renderItem={(item) => {
            return (
              <div
                style={{
                  width: state.slideWidth,
                  height: state.slideHeight,
                }}
                className="relative border border-primary/25 hover:border-primary/50"
              >
                <Image
                  className="pointer-events-none object-cover size-full"
                  src={item}
                  alt="Stylizacja"
                  width={state.slideWidth}
                  height={state.slideHeight}
                  resize="fill"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              </div>
            );
          }}
          slideWidth={state.slideWidth}
          slideHeight={state.slideHeight}
          slideOffset1={state.slideOffset1}
          slideOffset2={state.slideOffset2}
          sizeOffset1={state.sizeOffset1}
          sizeOffset2={state.sizeOffset2}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />
      </Section>

      <ImagesDrawerCarousel
        images={images}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        defaultActiveIndex={activeIndex}
      />
    </>
  );
}

const getCircularSlice = <T,>(
  array: Array<T>,
  startIndex: number,
  count: number
) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    const index = (startIndex + i) % array.length;
    result.push({ item: array[index], originalIndex: index });
  }
  return result;
};

const getShortestPath = (from: number, to: number, arrayLength: number) => {
  const forward = (to - from + arrayLength) % arrayLength;
  const backward = (from - to + arrayLength) % arrayLength;

  if (forward <= backward) {
    return { direction: 1, steps: forward };
  } else {
    return { direction: -1, steps: backward };
  }
};

interface SwipableCardsProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  slideWidth: number;
  slideHeight: number;
  slideOffset1: number;
  slideOffset2: number;
  sizeOffset1: number;
  sizeOffset2: number;
  activeIndex: number;
  setActiveIndex: (index: number | ((prev: number) => number)) => void;
  onActiveItemClick: () => void;
}

const SwipableCards = <T,>({
  items,
  renderItem,
  slideWidth,
  slideHeight,
  slideOffset1,
  slideOffset2,
  sizeOffset1,
  sizeOffset2,
  activeIndex,
  setActiveIndex,
  onActiveItemClick,
}: SwipableCardsProps<T>) => {
  const originalItemsLength = items.length;

  // Track if we just performed a drag to prevent onClick firing
  const isDraggingRef = React.useRef(false);
  const hasDraggedRef = React.useRef(false);

  // Create duplicated items for visual effect (minimum 5 items needed)
  let displayItems = items;
  if (items.length < 5) {
    const duplicationsNeeded = Math.ceil(5 / items.length);
    displayItems = Array(duplicationsNeeded).fill(items).flat();
  }

  const [effectiveIndex, setEffectiveIndex] = React.useState(0);

  useEffect(() => {
    if (effectiveIndex === activeIndex) return;

    const { direction } = getShortestPath(
      effectiveIndex,
      activeIndex,
      displayItems.length
    );

    const interval = setInterval(() => {
      setEffectiveIndex((prev) => {
        const newIndex =
          (prev + direction + displayItems.length) % displayItems.length;

        if (newIndex === activeIndex) {
          clearInterval(interval);
        }

        return newIndex;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [activeIndex, effectiveIndex, displayItems.length]);

  const startingIndex =
    (effectiveIndex - 2 + displayItems.length) % displayItems.length;
  const visibleItems = getCircularSlice(displayItems, startingIndex, 5);

  const handleNavigate = (index: number) => {
    setActiveIndex(index);
  };

  const handlePrevious = () => {
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + displayItems.length) % displayItems.length
    );
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % displayItems.length);
  };

  const getOriginalIndex = (displayIndex: number) => {
    return displayIndex % originalItemsLength;
  };

  return (
    <div className="relative flex flex-col items-center justify-center max-w-screen overflow-x-visible">
      <motion.div
        style={{
          position: "relative",
          width:
            2 *
            (slideOffset1 +
              slideOffset2 +
              (slideWidth * ((100 - sizeOffset1 - sizeOffset2) / 100)) / 2),
          height: slideHeight,
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        // Track when dragging starts
        onDragStart={() => {
          isDraggingRef.current = true;
          hasDraggedRef.current = false;
        }}
        onDrag={(_, info) => {
          // Mark that we've moved significantly during this drag
          // This prevents accidental clicks from tiny movements
          if (Math.abs(info.offset.x) > 5) {
            hasDraggedRef.current = true;
          }
        }}
        onDragEnd={(_, info) => {
          const threshold = 50;
          if (info.offset.x > threshold) {
            handlePrevious();
          } else if (info.offset.x < -threshold) {
            handleNext();
          }

          // Keep isDragging true for a brief moment to prevent onClick
          // This gives us time to ignore the click event that follows
          setTimeout(() => {
            isDraggingRef.current = false;
            hasDraggedRef.current = false;
          }, 100);
        }}
      >
        <AnimatePresence mode="popLayout">
          {visibleItems.map(({ item, originalIndex }, index) => {
            const position = index - 2;

            let x = 0;
            let scale = 1;
            let zIndex = 2;

            switch (position) {
              case -2:
                x = -slideOffset1 - slideOffset2;
                scale = (100 - sizeOffset1 - sizeOffset2) / 100;
                zIndex = 0;
                break;
              case -1:
                x = -slideOffset1;
                scale = (100 - sizeOffset1) / 100;
                zIndex = 1;
                break;
              case 1:
                x = slideOffset1;
                scale = (100 - sizeOffset1) / 100;
                zIndex = 1;
                break;
              case 2:
                x = slideOffset1 + slideOffset2;
                scale = (100 - sizeOffset1 - sizeOffset2) / 100;
                zIndex = 0;
                break;
            }

            return (
              <motion.div
                key={originalIndex}
                onClick={() => {
                  // Prevent click if we just finished dragging
                  if (isDraggingRef.current || hasDraggedRef.current) {
                    return;
                  }

                  if (position === 0) {
                    onActiveItemClick();
                  } else {
                    handleNavigate(originalIndex);
                  }
                }}
                initial={{
                  x: position === -2 || position === 2 ? 0 : x,
                  scale:
                    position === -2 || position === 2
                      ? (100 - sizeOffset1 - sizeOffset2) / 100
                      : scale,
                  opacity: position === -2 || position === 2 ? 0 : 1,
                }}
                animate={{ x, scale, opacity: 1 }}
                exit={{
                  x: 0,
                  opacity: 0,
                  scale: (100 - sizeOffset1 - sizeOffset2) / 100,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  zIndex,
                  width: slideWidth,
                  height: slideHeight,
                }}
                className={cn(
                  {
                    "brightness-60 cursor-pointer":
                      position === 2 || position === -2,
                    "brightness-95 cursor-pointer":
                      position === 1 || position === -1,
                    "brightness-100 cursor-zoom-in": position === 0,
                  },
                  "transform -translate-x-1/2 -translate-y-1/2"
                )}
              >
                {renderItem(item, index)}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <SlideIndicator className="mt-4">
        <SlideIndicatorPrev onClick={handlePrevious} />
        <SlideIndicatorContent>
          {Array.from({ length: originalItemsLength }).map((_, index) => (
            <SlideIndicatorItem
              key={index}
              isActive={index === getOriginalIndex(effectiveIndex)}
              onClick={() => {
                const displayIndex = displayItems.findIndex(
                  (_, i) => i % originalItemsLength === index
                );
                handleNavigate(displayIndex);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </SlideIndicatorContent>
        <SlideIndicatorNext onClick={handleNext} />
      </SlideIndicator>
    </div>
  );
};
