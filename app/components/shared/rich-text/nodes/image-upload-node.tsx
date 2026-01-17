import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";

import {
  FileUpload,
  FileUploadDropzone,
  FileUploadErrors,
  FileUploadPreviewContainer,
  FileUploadPreviewItem,
} from "~/components/shared/file-upload/file-upload";
import {
  focusNextNode,
  isValidPosition,
} from "~/components/shared/rich-text/utils";
import { useFileUpload } from "~/hooks/use-file-upload";

import type { ImageUploadNodeOptions } from "../extentions/image-upload-extension";

export const ImageUploadNode: React.FC<NodeViewProps> = (props) => {
  const { accept, maxFiles, maxSize, minSize, upload, onError, onSuccess } =
    props.extension.options as ImageUploadNodeOptions;
  const extension = props.extension;

  const { fileItems, handleFilesUpload, handleFileRemove } =
    useFileUpload<string>({
      accept,
      maxSize,
      maxFiles,
      minSize,
      upload,
      onSuccess,
      onError,
    });

  const handleUpload = async (files: File[]) => {
    const urls = await handleFilesUpload(files);

    if (urls.length > 0) {
      const pos = props.getPos();

      if (isValidPosition(pos)) {
        const imageNodes = urls.map((url, index) => {
          const filename =
            files[index]?.name.replace(/\.[^/.]+$/, "") || "unknown";
          return {
            type: extension.options.type,
            attrs: {
              ...extension.options,
              src: url,
              alt: filename,
              title: filename,
            },
          };
        });

        props.editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + props.node.nodeSize })
          .insertContentAt(pos, imageNodes)
          .run();

        focusNextNode(props.editor);
      }
    }
  };

  return (
    <NodeViewWrapper tabIndex={0}>
      <FileUpload
        maxFiles={maxFiles}
        maxSize={maxSize}
        minSize={minSize}
        accept={accept}
        multiple
        onUpload={(files) => handleUpload(files)}
      >
        <FileUploadDropzone />
        <FileUploadPreviewContainer>
          {fileItems.map((fileItem) => (
            <FileUploadPreviewItem
              key={fileItem.id}
              file={fileItem.file}
              status={fileItem.status}
              onRemove={() => handleFileRemove(fileItem.id)}
            />
          ))}
        </FileUploadPreviewContainer>
        <FileUploadErrors />
      </FileUpload>
    </NodeViewWrapper>
  );
};
