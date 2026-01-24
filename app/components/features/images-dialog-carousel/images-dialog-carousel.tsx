import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import React from "react";
import { A11y, Keyboard, Mousewheel, Zoom } from "swiper/modules";
import { Swiper as SwiperComp, SwiperSlide } from "swiper/react";

import { Image } from "~/components/ui/image";

function ImagesDrawerCarousel({
  images: rawImages,
  isDialogOpen,
  setIsDialogOpen,
  defaultActiveIndex,
}: {
  images: string[];
  isDialogOpen: boolean;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  defaultActiveIndex: number;
}) {
  const images = React.useMemo(() => {
    const images = [...rawImages];
    while (images.length < 8) {
      images.push(...images);
    }

    return images;
  }, [rawImages]);

  return (
    <DialogPrimitive.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Close
          data-slot="dialog-close"
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          <XIcon className="size-8" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] h-[80vh] z-50 w-full translate-x-[-50%] translate-y-[-50%] shadow-lg duration-200 outline-none">
          <SwiperComp
            freeMode={{
              enabled: true,
              sticky: false,
            }}
            loop
            centeredSlides
            initialSlide={defaultActiveIndex}
            zoom={{
              maxRatio: 3,
              minRatio: 1,
              toggle: false,
              panOnMouseMove: true,
            }}
            modules={[A11y, Keyboard, Mousewheel, Zoom]}
            keyboard
            mousewheel
            spaceBetween={10}
            breakpoints={{
              0: {
                slidesPerView: 1,
              },
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
              1280: {
                slidesPerView: 4,
              },
            }}
            className="w-full h-full"
            onClick={(swiper, event) => {
              const clickedSlide = (event.target as HTMLElement).closest(
                ".swiper-slide"
              );
              const slideIndex = parseInt(
                clickedSlide?.getAttribute("data-index") || "0"
              );

              if (swiper.realIndex % images.length === slideIndex) {
                swiper.zoom.toggle();
                return;
              } else {
                swiper.zoom.out();
                swiper.slideToLoop(slideIndex);
                setTimeout(() => {
                  swiper.zoom.toggle();
                }, 200);
              }
            }}
          >
            {images.map((image, index) => (
              <SwiperSlide
                data-index={index % images.length}
                key={`${image}-${index}`}
                zoom
                className="overflow-hidden cursor-zoom-in"
              >
                <div className="border border-primary/50  size-full">
                  <Image
                    src={image}
                    alt={`Image ${(index % images.length) + 1}`}
                    priority
                    mode="contain"
                    className="size-full"
                  />
                </div>
              </SwiperSlide>
            ))}
          </SwiperComp>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { ImagesDrawerCarousel };

/**
https://res.cloudinary.com/dbpz6wtou/image/upload/f_auto/q_auto:best/c_scale,w_400/co_black,e_colorize:70/lldoln9rvh3mjmkwithv?_a=DAJHqpDbZAAD
 */
