import {
  AlertCircleIcon,
  CloudUpload,
  FileArchiveIcon,
  FileAudioIcon,
  FileCodeIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileTypeIcon,
  FileVideoIcon,
  ImageIcon,
  XIcon,
} from "lucide-react";
import React, { useCallback } from "react";
import type {
  Accept,
  DropzoneOptions,
  DropzoneState,
  FileRejection,
} from "react-dropzone";
import { useDropzone } from "react-dropzone";

import { Button, buttonVariants } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Input } from "~/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { Spinner } from "~/components/ui/spinner";

import { cn } from "~/lib/utils";

// --- Context ---
type FileUploadContextType = Pick<
  DropzoneState,
  | "isDragActive"
  | "isDragAccept"
  | "isDragReject"
  | "isFocused"
  | "getRootProps"
  | "getInputProps"
> & {
  accept: Accept;
  errors: string[];
  disabled: boolean;
  minSize?: number;
  maxSize?: number;
};

const FileUploadContext = React.createContext<FileUploadContextType | null>(
  null
);

const useFileUploadContext = () => {
  const context = React.useContext(FileUploadContext);
  if (!context) {
    throw new Error(
      "useFileUploadContext must be used within a FileUploadProvider"
    );
  }
  return context;
};

// --- Root Component ---

type FileUploadProps = React.ComponentProps<"div"> &
  Pick<
    DropzoneOptions,
    | "accept"
    | "minSize"
    | "maxSize"
    | "maxFiles"
    | "validator"
    | "maxFiles"
    | "disabled"
  > & {
    onValidationError?: (rejections: FileRejection[]) => void;
  } & (
    | {
        onUpload: (file: File) => void | Promise<void>;
        multiple?: false;
      }
    | {
        onUpload: (files: File[]) => void | Promise<void>;
        multiple: true;
      }
  );

const FileUpload = ({
  accept = {
    "image/*": [".jpg", ".jpeg", ".png", ".gif"],
  },
  minSize = 0,
  maxSize = Infinity,
  maxFiles = 0,
  validator,
  multiple = false,
  onUpload,
  onValidationError,
  className,
  disabled = false,
  ...props
}: FileUploadProps) => {
  const [errors, setErrors] = React.useState<string[]>([]);

  const onDrop = useCallback<NonNullable<DropzoneOptions["onDrop"]>>(
    (acceptedFiles, rejectedFiles) => {
      // reset errors
      setErrors([]);

      // call validation error callback if exists
      if (rejectedFiles.length > 0 && onValidationError) {
        onValidationError(rejectedFiles);
      }

      // handle accepted files
      if (multiple) {
        (onUpload as (files: File[]) => Promise<void>)(acceptedFiles);
      } else {
        const [file] = acceptedFiles;
        if (!file) return;

        (onUpload as (file: File) => Promise<void>)(file);
      }
    },
    [multiple, onValidationError, onUpload]
  );

  const onError = useCallback<NonNullable<DropzoneOptions["onError"]>>(
    (error) => {
      setErrors((prevErrors) => [...prevErrors, error.message]);
    },
    []
  );

  const {
    isDragActive,
    isDragAccept,
    isDragReject,
    isFocused,
    getRootProps,
    getInputProps,
  } = useDropzone({
    noDragEventsBubbling: true,
    accept,
    minSize,
    maxSize,
    maxFiles,
    validator,
    onDrop,
    onError,
    disabled,
  });

  return (
    <FileUploadContext.Provider
      value={{
        isDragActive,
        isDragAccept,
        isDragReject,
        isFocused,
        getRootProps,
        getInputProps,
        accept,
        errors,
        disabled,
        minSize,
        maxSize,
      }}
    >
      <div className={cn("flex flex-col gap-2", className)} {...props} />
    </FileUploadContext.Provider>
  );
};

// --- File Input Dropzone ---

const FileUploadDropzone = ({
  className,
  "aria-invalid": ariaInvalid,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "disabled">) => {
  const {
    isDragActive,
    isDragAccept,
    isDragReject,
    isFocused,
    getRootProps,
    getInputProps,
    accept,
    disabled,
  } = useFileUploadContext();

  const fileTypeNames = getFileTypesNames(accept);

  return (
    <Empty
      {...getRootProps()}
      className={cn(
        "border border-dashed transition-all cursor-pointer outline-none hover:bg-accent dark:hover:bg-accent/50",
        isFocused && "border-ring ring-ring/50 ring-[3px]",
        disabled && "pointer-events-none opacity-50 cursor-not-allowed",
        {
          "border-blue-500": isDragActive,
          "border-green-500": isDragAccept,
          "ring-destructive/20 dark:ring-destructive/40 border-destructive text-destructive":
            isDragReject || ariaInvalid,
        },
        className
      )}
    >
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className={cn((isDragReject || ariaInvalid) && "text-destructive")}
        >
          <CloudUpload />
        </EmptyMedia>
        <EmptyTitle>Drag and drop</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <div
          className={cn(
            buttonVariants({
              variant: "outline",
              size: "sm",
            })
          )}
        >
          Click to upload
        </div>
        <EmptyDescription>
          <span>
            {fileTypeNames.slice(0, -1).join(", ")}
            {fileTypeNames.length > 1 ? " or " : ""}
            {fileTypeNames.slice(-1)}
          </span>
        </EmptyDescription>
      </EmptyContent>

      <Input
        {...getInputProps()}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        {...props}
      />
    </Empty>
  );
};

// --- File Input Preview Container ---

const FileUploadPreviewContainer = ({
  className,
  ...props
}: React.ComponentProps<typeof ItemGroup>) => {
  return <ItemGroup className={cn("gap-2", className)} {...props} />;
};

// --- File Input Preview Item ---

const FileUploadPreviewItem = ({
  file,
  status = "success",
  onRemove,
  className,
  ...props
}: React.ComponentProps<typeof Item> & {
  file: File;
  status?: "uploading" | "success" | "error";
  onRemove?: () => void;
}) => {
  const previewUrl = file ? getPreviewUrl(file) : null;
  const IconElement = getFileIcon(file);

  return (
    <Item
      className={cn(
        "relative",
        status === "uploading" && "animate-pulse",
        status === "error" && "border-destructive",
        className
      )}
      variant="outline"
      size="sm"
      {...props}
    >
      {status === "uploading" && (
        <Spinner className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-10" />
      )}

      <ItemMedia variant={!!previewUrl ? "image" : "icon"} className="relative">
        {status === "error" ? (
          <AlertCircleIcon className="text-destructive" />
        ) : !!previewUrl ? (
          <img
            src={previewUrl}
            alt={file.name ?? "File preview"}
            className="absolute inset-0 object-cover"
          />
        ) : (
          IconElement
        )}
      </ItemMedia>

      <ItemContent>
        <ItemTitle>{file.name}</ItemTitle>
        <ItemDescription>
          <span>{getFormattedFileType(file)}</span>
          {" • "}
          <span>{getReadableFileSize(file.size)}</span>
          {status === "error" && (
            <>
              {" • "}
              <span className="text-destructive">Upload failed</span>
            </>
          )}
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        <Button
          size="icon"
          onClick={onRemove}
          variant="ghost"
          disabled={!onRemove}
        >
          <XIcon />
        </Button>
      </ItemActions>
    </Item>
  );
};

// --- File Input Errors ---

const FileUploadErrors = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const { errors } = useFileUploadContext();

  if (errors.length === 0) return null;

  return (
    <div
      className={cn("flex flex-col gap-1 text-destructive", className)}
      {...props}
    >
      {errors.map((error, index) => (
        <span key={index} className="text-sm">
          {error}
        </span>
      ))}
    </div>
  );
};

export {
  FileUpload,
  FileUploadDropzone,
  FileUploadPreviewContainer,
  FileUploadPreviewItem,
  FileUploadErrors,
};

// --- Utility Functions ---

const MIME_TYPES = {
  // Images
  image: {
    icon: <ImageIcon />,
    label: "Image",
    extensions: [
      "png",
      "jpeg",
      "jpg",
      "gif",
      "webp",
      "svg",
      "bmp",
      "tiff",
      "heic",
    ],
  },

  // Documents
  pdf: {
    icon: <FileTextIcon />,
    label: "PDF Document",
    mimeTypes: ["application/pdf"],
  },

  text: {
    icon: <FileTextIcon />,
    label: "Text File",
    mimeTypes: ["text/plain"],
  },

  spreadsheet: {
    icon: <FileSpreadsheetIcon />,
    label: "Spreadsheet",
    mimeTypes: [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },

  document: {
    icon: <FileTextIcon />,
    label: "Document",
    mimeTypes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },

  presentation: {
    icon: <FileTypeIcon />,
    label: "Presentation",
    mimeTypes: [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  },

  code: {
    icon: <FileCodeIcon />,
    label: "Code",
    mimeTypes: [
      "text/html",
      "text/css",
      "text/javascript",
      "application/json",
      "application/xml",
      "application/javascript",
      "application/x-typescript",
    ],
  },

  audio: {
    icon: <FileAudioIcon />,
    label: "Audio",
    extensions: ["mp3", "wav", "ogg", "webm", "flac"],
  },

  video: {
    icon: <FileVideoIcon />,
    label: "Video",
    extensions: ["mp4", "webm", "ogg", "mkv"],
  },

  archive: {
    icon: <FileArchiveIcon />,
    label: "Archive",
    mimeTypes: [
      "application/zip",
      "application/x-7z-compressed",
      "application/x-rar-compressed",
      "application/x-tar",
      "application/gzip",
    ],
  },
} as const;

// Build reverse lookup maps
const MIME_TO_TYPE = new Map<string, keyof typeof MIME_TYPES>();
Object.entries(MIME_TYPES).forEach(([type, config]) => {
  if ("mimeTypes" in config) {
    config.mimeTypes.forEach((mime) => {
      MIME_TO_TYPE.set(mime, type as keyof typeof MIME_TYPES);
    });
  }
});

export function getPreviewUrl(file: File): string | null {
  if (!file) return null;

  // Only images can be previewed via object URL
  if (file.type.startsWith("image/")) {
    return URL.createObjectURL(file);
  }

  return null;
}

export function getFileIcon(file: File): React.ReactNode {
  // Check specific MIME type first
  const typeKey = MIME_TO_TYPE.get(file.type);
  if (typeKey) return MIME_TYPES[typeKey].icon;

  // Check by category (image/*, video/*, audio/*)
  const category = file.type.split("/")[0];
  if (category === "image") return MIME_TYPES.image.icon;
  if (category === "video") return MIME_TYPES.video.icon;
  if (category === "audio") return MIME_TYPES.audio.icon;

  // Fallback
  return <FileTypeIcon />;
}

export function getFormattedFileType(file: File): string {
  // Check specific MIME type
  const typeKey = MIME_TO_TYPE.get(file.type);
  if (typeKey) return MIME_TYPES[typeKey].label;

  // Check by category
  const category = file.type.split("/")[0];
  if (category === "image") return "Image";
  if (category === "video") return "Video";
  if (category === "audio") return "Audio";

  // Fallback to extension
  const ext = file.name.split(".").pop()?.toUpperCase();
  return ext ? `${ext} File` : "File";
}

export function getReadableFileSize(rawSize: number): string {
  if (rawSize === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(rawSize) / Math.log(1024));
  const size = (rawSize / Math.pow(1024, i)).toFixed(2);

  return `${size} ${units[i]}`;
}

export function getFileTypesNames(accept: Accept): string[] {
  const types = new Set<string>();

  Object.entries(accept).forEach(([mimeType, extensions]) => {
    if (extensions?.length) {
      // Add extensions like ".png" → "PNG"
      extensions.forEach((ext) =>
        types.add(ext.replace(/^\./, "").toUpperCase())
      );
    } else {
      // Add category like "image/*" → "Image"
      const category = mimeType.split("/")[0];
      types.add(
        (category?.charAt(0).toUpperCase() ?? "") + (category?.slice(1) ?? "")
      );
    }
  });

  return Array.from(types);
}
