import { Node, mergeAttributes } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { ImageUploadNode as ImageUploadNodeComponent } from "../nodes/image-upload-node";

export type UploadFunction = (file: File) => Promise<string>;

export interface ImageUploadNodeOptions {
  accept?: {
    [key: string]: readonly string[];
  };
  maxFiles?: number;
  minSize?: number;
  maxSize?: number;
  upload: UploadFunction;
  onError?: (error: unknown) => void;
  onSuccess?: (url: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    imageUpload: {
      setImageUploadNode: () => ReturnType;
    };
  }
}

const ImageUploadNode = Node.create<ImageUploadNodeOptions>({
  name: "imageUpload",
  group: "block",
  draggable: true,
  selectable: true,
  atom: true,
  addOptions() {
    return {
      type: "image",
      accept: {
        "image/*": [
          "." + "png",
          "." + "jpg",
          "." + "jpeg",
          "." + "gif",
          "." + "webp",
        ],
      },
      maxFiles: 1,
      minSize: 0,
      maxSize: 0,
      upload: () =>
        Promise.reject(new Error("Upload function not implemented")),
      onError: undefined,
      onSuccess: undefined,
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-upload"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "image-upload" }, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageUploadNodeComponent);
  },

  addCommands() {
    return {
      setImageUploadNode:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },
});

export { ImageUploadNode };
