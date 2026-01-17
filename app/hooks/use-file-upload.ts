import React from "react";

type FileItem<TResult> = {
  id: string;
  file: File;
} & (
  | { status: "uploading" | "error"; info: null }
  | {
      status: "success";
      info: TResult;
    }
);

interface UseFileUploadArgs<TResult> {
  defaultValues?: FileItem<TResult>[];
  upload: (file: File) => Promise<TResult>;
  minSize?: number;
  maxSize?: number;
  accept?: {
    [key: string]: readonly string[];
  };
  maxFiles?: number;
  onError?: (error: unknown) => void;
  onValidationError?: (file: File, error: string) => void;
  onSuccess?: (response: TResult) => void;
}

interface UseFileUploadReturn<TResult> {
  fileItems: FileItem<TResult>[];
  handleFilesUpload: (files: File[]) => Promise<TResult[]>;
  handleFileUpload: (file: File) => Promise<TResult | null>;
  handleFileRemove: (ids: string) => void;
  clearAllFiles: () => void;
}

export const useFileUpload = <TResult>({
  defaultValues = [],
  upload,
  minSize,
  maxSize,
  accept,
  maxFiles,
  onError,
  onValidationError,
  onSuccess,
}: UseFileUploadArgs<TResult>): UseFileUploadReturn<TResult> => {
  const [fileItems, setFileItems] =
    React.useState<FileItem<TResult>[]>(defaultValues);

  const validate = React.useCallback(
    (file: File): string | null => {
      if (minSize !== undefined && file.size < minSize) {
        return `File size is too small. Minimum size is ${minSize} bytes.`;
      }

      if (maxSize !== undefined && file.size > maxSize) {
        return `File size is too large. Maximum size is ${maxSize} bytes.`;
      }

      if (accept) {
        const mimeType = file.type;
        const fileName = file.name.toLowerCase();

        // Check if MIME type matches any key
        const isAccepted = Object.entries(accept).some(([mime, extensions]) => {
          // Check MIME type match (supports wildcards like "image/*")
          const mimePattern = mime.replace("*", ".*");
          const mimeRegex = new RegExp(`^${mimePattern}$`);
          const mimeMatches = mimeRegex.test(mimeType);

          // Check extension match
          const extensionMatches = extensions.some((ext) =>
            fileName.endsWith(ext.toLowerCase())
          );

          return mimeMatches || extensionMatches;
        });

        if (!isAccepted) {
          return `File type "${mimeType}" is not accepted.`;
        }
      }

      if (maxFiles !== undefined && fileItems.length >= maxFiles) {
        return `Maximum number of files (${maxFiles}) exceeded.`;
      }

      return null;
    },
    [accept, fileItems.length, maxFiles, maxSize, minSize]
  );

  const handleFileUpload = React.useCallback(
    async (file: File) => {
      const validationError = validate(file);
      if (validationError) {
        onValidationError?.(file, validationError);
        return null;
      }

      const fileId = crypto.randomUUID();

      const newFileItem: FileItem<TResult> = {
        id: fileId,
        file,
        status: "uploading",
        info: null,
      };

      setFileItems((prev) => [...prev, newFileItem]);

      try {
        const apiReturn = await upload(file);

        onSuccess?.(apiReturn);

        setFileItems((prev) =>
          prev.map((item) =>
            item.id === fileId
              ? { ...item, status: "success", info: apiReturn }
              : item
          )
        );

        return apiReturn;
      } catch (error) {
        onError?.(error);

        setFileItems((prev) =>
          prev.map((item) =>
            item.id === fileId ? { ...item, status: "error", info: null } : item
          )
        );

        return null;
      }
    },
    [onError, onSuccess, onValidationError, upload, validate]
  );

  const handleFilesUpload = React.useCallback(
    async (file: File[]) => {
      const results = await Promise.all(file.map((f) => handleFileUpload(f)));

      return results.filter(
        (result): result is Awaited<TResult> => result !== null
      ) as TResult[];
    },
    [handleFileUpload]
  );

  const handleFileRemove = React.useCallback((ids: string | string[]) => {
    const idsToRemove = Array.isArray(ids) ? ids : [ids];
    setFileItems((prev) =>
      prev.filter((item) => !idsToRemove.includes(item.id))
    );
  }, []);

  const clearAllFiles = React.useCallback(() => {
    setFileItems([]);
  }, []);

  return {
    fileItems,
    handleFilesUpload,
    handleFileUpload,
    handleFileRemove,
    clearAllFiles,
  };
};
