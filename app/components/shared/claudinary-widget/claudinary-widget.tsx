import React from "react";

import clodinaryLocalisation from "~/lib/claudinary-localisation.json";
import type { CloudinaryResult } from "~/lib/types";

// Load Cloudinary Upload Widget Script
const loadCloudinaryWidget = () => {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).cloudinary) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Cloudinary widget"));
    document.body.appendChild(script);
  });
};

interface CloudinaryWidgetProps {
  uploadPreset: string;
  onSuccess: (result: CloudinaryResult) => void;
  onDisplayChanged?: (isOpen: boolean) => void;
  children: (props: { open: () => void }) => React.ReactNode;
  options?: {
    clientAllowedFormats?: string[];
    language?: string;
    text?: any;
  };
}

function CloudinaryWidget({
  uploadPreset,
  onSuccess,
  onDisplayChanged,
  children,
  options = {},
}: CloudinaryWidgetProps) {
  const widgetRef = React.useRef<any>(null);

  React.useEffect(() => {
    loadCloudinaryWidget();
  }, []);

  const open = () => {
    if (!widgetRef.current) {
      const cloudinary = (window as any).cloudinary;
      if (!cloudinary) {
        console.error("Cloudinary widget not loaded");
        return;
      }

      widgetRef.current = cloudinary.createUploadWidget(
        {
          cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "",
          uploadPreset: uploadPreset,
          clientAllowedFormats: options.clientAllowedFormats || [
            "png",
            "jpeg",
            "jpg",
            "webp",
            "svg",
          ],
          language: options.language || "pl",
          text: options.text || clodinaryLocalisation,
        },
        (error: any, result: any) => {
          if (error) {
            console.error("Upload error:", error);
            return;
          }

          if (result.event === "success") {
            onSuccess(result.info as CloudinaryResult);
          }

          if (result.event === "display-changed") {
            onDisplayChanged?.(result.info === "shown");
          }
        }
      );
    }

    widgetRef.current.open();
  };

  return <>{children({ open })}</>;
}

export { CloudinaryWidget };
