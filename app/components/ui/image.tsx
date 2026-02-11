import {
  AdvancedImage,
  lazyload,
  placeholder,
  responsive,
} from "@cloudinary/react";
import { defaultImage, dpr } from "@cloudinary/url-gen/actions/delivery";
import { trim } from "@cloudinary/url-gen/actions/reshape";
import {
  auto,
  autoPad,
  crop,
  fill,
  fillPad,
  fit,
  limitFill,
  limitFit,
  limitPad,
  minimumFit,
  minimumPad,
  pad,
  scale,
  thumbnail,
} from "@cloudinary/url-gen/actions/resize";
import { Dpr } from "@cloudinary/url-gen/qualifiers";
import { Color } from "@cloudinary/url-gen/qualifiers/color";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import type { ImageFormatType } from "@cloudinary/url-gen/types/types";
import type { QualityTypes } from "@cloudinary/url-gen/types/types";
import React from "react";

import { cld, extractPublicId } from "~/lib/claudinary";

type ResizeSimpleAction =
  | ReturnType<typeof fit>
  | ReturnType<typeof limitFit>
  | ReturnType<typeof minimumFit>
  | ReturnType<typeof scale>;

type ResizeAdvancedAction =
  | ReturnType<typeof auto>
  | ReturnType<typeof crop>
  | ReturnType<typeof fill>
  | ReturnType<typeof limitFill>
  | ReturnType<typeof thumbnail>;

type ResizePadAction =
  | ReturnType<typeof fillPad>
  | ReturnType<typeof limitPad>
  | ReturnType<typeof minimumPad>
  | ReturnType<typeof pad>
  | ReturnType<typeof autoPad>;

const RESIZE_MAP = {
  // supports height, width, aspectRatio
  fit: fit,
  limitFit: limitFit,
  minimumFit: minimumFit,
  scale: scale,

  // supports gravity
  auto: auto,
  crop: crop,
  fill: fill,
  limitFill: limitFill,
  thumbnail: thumbnail,

  // supports background
  fillPad: fillPad,
  limitPad: limitPad,
  minimumPad: minimumPad,
  pad: pad,
  autoPad: autoPad,
};

interface ImageProps extends Omit<React.ComponentProps<"img">, "src" | "alt"> {
  // image
  src: string;
  alt: string;

  // plugins options
  lazyload?: boolean;
  placeholder?: "vectorize" | "pixelate" | "blur" | "predominant-color";
  responsive?: boolean;

  // delivery options
  defaultImage?: string;
  dpr?: `${number}.${number}` | number | ReturnType<typeof Dpr.auto>;
  quality?: QualityTypes;
  format?: ImageFormatType;

  // effect options
  trim?: boolean;

  //resize options
  width?: number;
  height?: number;
  aspectRatio?: number;
  background?: keyof typeof Color;
  gravity?: boolean;
  resize?:
    | "none"
    //object-contain (never crop, always fit inside):
    | "fit"
    | "pad" // (contain + background fill)
    | "limitFit" // (fit but never upscale)
    | "limitPad" // (pad but never upscale)
    | "minimumFit" // (fit to smallest dimension)
    | "minimumPad" // (pad to smallest dimension)

    //object-cover (fill container, crop overflow):
    | "fill" // (fills exactly, crops as needed)
    | "limitFill" // (fill but never upscale)
    | "crop" // (manual/gravity-based crop)
    | "thumbnail" // (smart crop with face detection)

    //object-fill (distort/stretch):
    | "scale" // (forces exact dimensions)

    //Hybrid/Special:
    | "fillPad" // (tries to fill, pads if aspect ratio doesn't match)
    | "autoPad"; // (automatic padding with content-aware background)
}

const Image = ({
  src,
  width,
  height,
  resize = "none",
  aspectRatio,
  background,
  gravity,
  responsive: isResponsive,
  fetchPriority,
  placeholder: placeholderMode,
  lazyload: isLazyload,
  trim: isTrim,
  quality = "auto",
  dpr: dprValue = Dpr.auto(),
  defaultImage: defaultImageValue,
  format: formatValue = "auto",
  alt,
  ref,
  sizes,
  srcSet,
  ...rest
}: ImageProps) => {
  const img = React.useMemo(() => {
    const image = cld.image(extractPublicId(src));

    // resize
    let action:
      | ResizeSimpleAction
      | ResizeAdvancedAction
      | ResizePadAction
      | undefined = undefined;
    if (resize !== "none") {
      action = RESIZE_MAP[resize as keyof typeof RESIZE_MAP]();
      if (width) action.width(width);
      if (height) action.height(height);
      if (aspectRatio) action.aspectRatio(aspectRatio);
      if (background && "background" in action)
        (action as ResizePadAction).background(Color[background]);
      if (gravity && "gravity" in action)
        (action as ResizeAdvancedAction).gravity(autoGravity());
    }
    if (action) image.resize(action);

    // effect
    if (isTrim) image.effect(trim());

    // delivery
    if (defaultImageValue) image.delivery(defaultImage(defaultImageValue));
    if (quality) image.quality(quality);
    if (formatValue) image.format(formatValue);
    if (dprValue) image.delivery(dpr(dprValue));

    return image;
  }, [
    aspectRatio,
    background,
    defaultImageValue,
    dprValue,
    formatValue,
    gravity,
    height,
    isTrim,
    quality,
    resize,
    src,
    width,
  ]);

  const plugins = React.useMemo(() => {
    if (fetchPriority === "high") {
      return [];
    }
    const base = [];
    if (isResponsive)
      base.push(
        responsive({
          // default tailwind breakpoints
          steps: [640, 768, 1024, 1280, 1536],
        })
      );
    if (placeholderMode) base.push(placeholder({ mode: placeholderMode }));
    if (isLazyload) base.push(lazyload());
    return base;
  }, [isResponsive, placeholderMode, isLazyload, fetchPriority]);

  return (
    <AdvancedImage
      cldImg={img}
      alt={alt}
      plugins={plugins}
      fetchPriority={fetchPriority}
      imageRef={ref}
      {...(!isResponsive && sizes ? { sizes } : {})}
      {...(!isResponsive && srcSet ? { srcSet } : {})}
      {...rest}
    />
  );
};

export default Image;
