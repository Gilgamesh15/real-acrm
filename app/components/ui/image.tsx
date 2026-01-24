import { AdvancedImage, lazyload, placeholder } from "@cloudinary/react";
import { dpr } from "@cloudinary/url-gen/actions/delivery";
import { limitFill, pad } from "@cloudinary/url-gen/actions/resize";
import React from "react";

import { cld, extractPublicId } from "~/lib/claudinary";

type ImageProps = Omit<
  React.ComponentProps<"img">,
  "height" | "width" | "loading" | "ref" | "alt" | "src" | "srcSet" | "sizes"
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

  // scalling
  scale?: number;
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
  quality = "auto",
  priority = false,
  scale = 1,
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
    image.delivery(dpr("auto"));

    return image;
  }, [src, width, scale, height, mode, aspectRatio, quality]);

  // Configure plugins
  const plugins = React.useMemo(() => {
    const pluginList = [placeholder({ mode: "blur" })];

    if (!priority) pluginList.push(lazyload());

    return pluginList;
  }, [priority]);

  return <AdvancedImage cldImg={img} alt={alt} plugins={plugins} {...rest} />;
};
