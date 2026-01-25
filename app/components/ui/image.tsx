import {
  AdvancedImage,
  lazyload,
  placeholder,
  responsive,
} from "@cloudinary/react";
import { limitFill, pad } from "@cloudinary/url-gen/actions/resize";
import React from "react";

import { cld, extractPublicId } from "~/lib/claudinary";

type ImageProps = Omit<
  React.ComponentProps<"img">,
  | "height"
  | "width"
  | "loading"
  | "ref"
  | "alt"
  | "src"
  | "srcSet"
  | "sizes"
  | "fetchPriority"
> & {
  src: string;
  alt: string;
  priority?: boolean;

  // quality
  quality?:
    | "auto"
    | "auto:best"
    | "auto:eco"
    | "auto:good"
    | "auto:low"
    | number;

  //mode
  mode?: "cover" | "contain";

  // sizing
  width?: number;
  height?: number;
  aspectRatio?: number;

  // scaling
  scale?: number;

  // sizes
  responsive?: boolean;

  // fetch priority for LCP optimization
  fetchPriority?: "high" | "low" | "auto";
};

// Resize mode mapping
const resizeMap = {
  cover: limitFill,
  contain: pad,
};

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  aspectRatio,
  mode = "contain",
  quality = "auto:good",
  priority = false,
  scale = 1,
  fetchPriority,
  responsive: isResponsive = false,
  ...rest
}) => {
  const img = React.useMemo(() => {
    const image = cld.image(extractPublicId(src));

    let w = width;
    if (w && scale) w = Math.round(w * scale);
    let h = height;
    if (h && scale) h = Math.round(h * scale);

    const action = resizeMap[mode]();
    if (w) action.width(w);
    if (h) action.height(h);
    if (aspectRatio) action.aspectRatio(aspectRatio);

    image.resize(action);
    image.format("auto");
    image.quality(quality);

    return image;
  }, [src, width, scale, height, mode, aspectRatio, quality]);

  // Configure plugins - skip blur placeholder for priority images to avoid extra network request
  const plugins = React.useMemo(() => {
    const base = [];
    if (isResponsive) base.push(responsive());
    if (priority) return base;
    return [placeholder({ mode: "vectorize" }), ...base, lazyload()];
  }, [priority, isResponsive]);

  return (
    <AdvancedImage
      cldImg={img}
      alt={alt}
      plugins={plugins}
      fetchPriority={fetchPriority}
      {...rest}
    />
  );
};
