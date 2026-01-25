import React from "react";
import { A11y, EffectCoverflow, Keyboard, Mousewheel } from "swiper/modules";
import { Swiper as SwiperComp, SwiperSlide } from "swiper/react";
import type { Swiper } from "swiper/types";

import { Image } from "~/components/ui/image";
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
  let displayImages = images.concat(images).concat(images);

  const [swiper, setSwiper] = React.useState<Swiper | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const config = useResponsiveState<{
    slideWidth: number;
    slideHeight: number;
  }>({
    base: {
      slideWidth: 240,
      slideHeight: 350,
    },
    sm: {
      slideWidth: 250,
      slideHeight: 370,
    },
    md: {
      slideWidth: 260,
      slideHeight: 380,
    },
    lg: {
      slideWidth: 255,
      slideHeight: 365,
    },
    xl: {
      slideWidth: 250,
      slideHeight: 380,
    },
    "2xl": {
      slideWidth: 310,
      slideHeight: 430,
    },
  });

  return (
    <>
      <Section centered padding="lg">
        <div className="max-w-full overflow-x-visible flex justify-center">
          <div className="w-fit">
            <SwiperComp
              onSwiper={setSwiper}
              onSlideChangeTransitionStart={(swiper) => {
                setActiveIndex(swiper.realIndex % images.length);
              }}
              breakpoints={{
                0: {
                  coverflowEffect: {
                    stretch: 150,
                    scale: 0.8,
                  },
                },
                640: {
                  coverflowEffect: {
                    stretch: 160,
                    scale: 0.85,
                  },
                },
                768: {
                  coverflowEffect: {
                    stretch: 80,
                    scale: 0.77,
                  },
                },
                1024: {
                  coverflowEffect: {
                    stretch: 90,
                    scale: 0.7,
                  },
                },
                1280: {
                  coverflowEffect: {
                    stretch: 60,
                    scale: 0.78,
                  },
                },
                1536: {
                  coverflowEffect: {
                    stretch: 50,
                    scale: 0.8,
                  },
                },
              }}
              centeredSlides
              slideToClickedSlide
              slidesPerView={5}
              style={{
                width: 5 * config.slideWidth,
                height: config.slideHeight,
              }}
              keyboard
              mousewheel={{
                forceToAxis: true,
              }}
              effect="coverflow"
              coverflowEffect={{
                rotate: 10,
                slideShadows: true,
              }}
              loop
              modules={[A11y, EffectCoverflow, Keyboard, Mousewheel]}
            >
              {displayImages.map((image, index) => (
                <SwiperSlide key={`${image}-${index}`}>
                  {({ isVisible, isActive }) => (
                    <div
                      onClick={() => {
                        if (isActive) {
                          setIsDialogOpen(true);
                        }
                      }}
                      className={cn(
                        "border border-primary/25 hover:border-primary/50 relative transition-all duration-300 size-full",
                        isVisible ? "opacity-100" : "opacity-0",
                        isActive ? "cursor-zoom-in" : "cursor-pointer"
                      )}
                    >
                      <Image
                        src={image}
                        alt="Stylizacja"
                        mode="cover"
                        className="size-full"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent" />
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </SwiperComp>
          </div>
        </div>

        <SlideIndicator>
          <SlideIndicatorPrev onClick={() => swiper?.slidePrev()} />
          <SlideIndicatorContent>
            {images.map((_, index) => (
              <SlideIndicatorItem
                key={index}
                isActive={index === activeIndex}
                onClick={() => swiper?.slideToLoop(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </SlideIndicatorContent>
          <SlideIndicatorNext onClick={() => swiper?.slideNext()} />
        </SlideIndicator>
      </Section>

      <ImagesDrawerCarousel
        images={displayImages}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        defaultActiveIndex={activeIndex}
      />
    </>
  );
}
