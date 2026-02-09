import React from "react";
import "swiper/css/zoom";
import { A11y, Keyboard, Mousewheel, Zoom } from "swiper/modules";
import { Swiper as SwiperComp, SwiperSlide } from "swiper/react";

import { Dialog, DialogContent } from "~/components/ui/dialog";
import Image from "~/components/ui/image";

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
    if (rawImages.length === 0) return [];

    // Repeat images until we have at least 8
    const repeated: string[] = [];
    while (repeated.length < 5) {
      repeated.push(...rawImages);
    }
    return repeated;
  }, [rawImages]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent
        showCloseButton={false}
        className="bg-transparent grid h-[80vh] max-w-screen gap-4 border-0 p-2 shadow-none sm:max-w-screen"
      >
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
            toggle: true,
            panOnMouseMove: false,
          }}
          modules={[A11y, Keyboard, Mousewheel, Zoom]}
          keyboard
          mousewheel={{
            forceToAxis: true,
          }}
          spaceBetween={10}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            640: {
              slidesPerView: 2,
            },
            1280: {
              slidesPerView: 3,
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
              className="cursor-zoom-in z-98"
            >
              <div className="overflow-hidden border border-primary/50 bg-background flex items-center justify-center size-full max-h-full relative z-100">
                <Image
                  src={image}
                  alt={`Image ${(index % images.length) + 1}`}
                  quality="auto:good"
                  responsive
                  resize="autoPad"
                  gravity
                  className="object-contain relative z-99"
                />
              </div>
            </SwiperSlide>
          ))}
        </SwiperComp>
      </DialogContent>
    </Dialog>
  );
}

export { ImagesDrawerCarousel };
