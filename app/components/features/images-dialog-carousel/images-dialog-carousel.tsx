import React from "react";
import {
  type ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";
import { Dialog, DialogContent } from "~/components/ui/dialog";

import { cn } from "~/lib/utils";

function ImagesDrawerCarousel({
  images,
  isDialogOpen,
  setIsDialogOpen,
  defaultActiveIndex,
}: {
  images: string[];
  isDialogOpen: boolean;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  defaultActiveIndex: number;
}) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [zoomedImageId, setZoomedImageId] = React.useState<string | undefined>(
    undefined
  );

  const isAnyImageZoomed = zoomedImageId !== undefined;

  const loopedImages: {
    id: string;
    url: string;
    alt: string;
  }[] = React.useMemo(() => {
    if (images.length <= 1)
      return images.map((image) => ({
        id: image,
        url: image,
        alt: `Image ${image}`,
      }));
    const loopedImages: {
      id: string;
      url: string;
      alt: string;
    }[] = [];
    let counter = 0;
    while (loopedImages.length < 6) {
      loopedImages.push(
        ...images.map((image) => ({
          id: `${image}-${counter++}`,
          url: image,
          alt: `Image ${image}`,
        }))
      );
    }
    return loopedImages;
  }, [images]);

  React.useEffect(() => {
    if (isDialogOpen && api) {
      setTimeout(() => {
        api.scrollTo(defaultActiveIndex, true);
      }, 0);
    }
  }, [isDialogOpen, api, defaultActiveIndex]);

  /**
   * Key Methods for Locking and Controlling Embla Carousel:
Disable/Lock Carousel: Use emblaApi.reInit({ active: false }) to stop all dragging and interaction.
Enable Carousel: Use emblaApi.reInit({ active: true }) to re-enable it.
   */
  React.useEffect(() => {
    if (!api) return;

    if (isAnyImageZoomed) {
      // Find the index of the image that just got zoomed
      const zoomedIndex = loopedImages.findIndex(
        (image) => image.id === zoomedImageId
      );

      // First, scroll to that image
      api.scrollTo(zoomedIndex);

      // Now we need to wait for the scroll animation to finish before locking
      // We'll use the 'settle' event which fires when carousel stops moving
      const handleSettle = () => {
        // Once the carousel has settled on the zoomed image, lock it
        api.reInit({ watchDrag: false, dragFree: false, align: "center" });
        // Clean up the listener since we only need it once
        api.off("settle", handleSettle);
      };

      // Listen for when the carousel finishes scrolling
      api.on("settle", handleSettle);

      // Cleanup function to remove listener if component unmounts
      // or if zoom state changes before settling
      return () => {
        api.off("settle", handleSettle);
      };
    } else {
      // When zooming out, simply re-enable the carousel
      // No need to wait for anything since we're unlocking
      api.reInit({
        watchDrag: true,
        dragFree: true,
        align: "center",
      });
    }
  }, [api, isAnyImageZoomed, loopedImages, zoomedImageId]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent
        showCloseButton={false}
        className="bg-transparent grid h-[80vh] max-w-screen gap-4 border-0 p-2 shadow-none sm:max-w-screen"
      >
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
            dragFree: true,
            align: "center",
          }}
          className="h-[80vh]"
        >
          <CarouselContent>
            {loopedImages.map((image) => (
              <ZoomableImage
                key={image.id}
                src={image.url}
                alt={image.alt}
                isZoomed={zoomedImageId === image.id}
                onZoomedChange={(zoom) =>
                  setZoomedImageId(zoom ? image.id : undefined)
                }
              />
            ))}
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
}

export { ImagesDrawerCarousel };

function ZoomableImage({
  src,
  alt,
  isZoomed,
  onZoomedChange,
}: {
  src: string;
  alt: string;
  isZoomed: boolean;
  onZoomedChange: (zoom: boolean) => void;
}) {
  const transformRef = React.useRef<ReactZoomPanPinchContentRef>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Track where the pointer was when the user first pressed down
  const pointerDownPosition = React.useRef<{ x: number; y: number } | null>(
    null
  );

  React.useEffect(() => {
    if (!isZoomed) {
      transformRef.current?.resetTransform(300);
    }
  }, [isZoomed]);

  // Record the position when the user first presses down
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPosition.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If we don't have a recorded pointer-down position, bail out
    // This shouldn't happen in normal use, but it's a safety check
    if (!pointerDownPosition.current) return;

    // Calculate how far the pointer moved between press and release
    const deltaX = Math.abs(e.clientX - pointerDownPosition.current.x);
    const deltaY = Math.abs(e.clientY - pointerDownPosition.current.y);

    // Define a threshold for what counts as "movement"
    // 5 pixels is small enough to account for tiny hand tremors
    // but large enough to catch intentional panning
    const moveThreshold = 5;

    // If the pointer moved more than our threshold, this was a pan, not a click
    // So we exit early and don't trigger zoom in/out
    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      return;
    }

    // If we got here, it was a true click with minimal movement
    if (!transformRef.current || !containerRef.current) return;

    const { setTransform, resetTransform, instance } = transformRef.current;
    const currentlyZoomed = instance.transformState.scale !== 1;

    if (currentlyZoomed) {
      resetTransform(300);
      onZoomedChange(false);
    } else {
      const containerRect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - containerRect.left;
      const clickY = e.clientY - containerRect.top;

      const scale = 2;
      const offsetX = -clickX * (scale - 1);
      const offsetY = -clickY * (scale - 1);

      setTransform(offsetX, offsetY, scale, 300, "easeOut");
      onZoomedChange(true);
    }
  };

  return (
    <CarouselItem
      className={cn("basis-full md:basis-1/2 lg:basis-1/3 h-[80vh]")}
    >
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown} // Capture the starting position
        onClick={handleImageClick} // Check movement and handle zoom
        className="overflow-hidden border border-primary/50 bg-background flex items-center justify-center size-full cursor-zoom-in"
      >
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={1}
          maxScale={4}
          doubleClick={{ disabled: true }}
          wheel={{ disabled: true }}
          panning={{
            disabled: !isZoomed,
          }}
        >
          <TransformComponent wrapperClass="!w-full !h-[80vh]">
            <img
              src={src}
              alt={alt}
              className="object-contain h-[80vh] pointer-events-none"
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
    </CarouselItem>
  );
}
