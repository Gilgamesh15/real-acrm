import { Blockquote } from "@tiptap/extension-blockquote";
import { Bold } from "@tiptap/extension-bold";
import { Code } from "@tiptap/extension-code";
import { CodeBlock } from "@tiptap/extension-code-block";
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Heading } from "@tiptap/extension-heading";
import { Image } from "@tiptap/extension-image";
import { Italic } from "@tiptap/extension-italic";
import { Link } from "@tiptap/extension-link";
import {
  BulletList,
  ListItem,
  ListKeymap,
  OrderedList,
  TaskItem,
  TaskList,
} from "@tiptap/extension-list";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Strike } from "@tiptap/extension-strike";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import { Text } from "@tiptap/extension-text";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Underline } from "@tiptap/extension-underline";
import {
  Dropcursor,
  Gapcursor,
  Placeholder,
  Selection,
  TrailingNode,
  UndoRedo,
} from "@tiptap/extensions";

import { HorizontalRule } from "./horizontal-rule-extension";
import { ImageUploadNode } from "./image-upload-extension";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  original_filename: string;
}

export async function uploadToCloudinary(
  file: File,
  uploadPreset: string,
  folder?: string
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  if (folder) {
    formData.append("folder", folder);
  }

  // Add timestamp for cache busting
  formData.append("timestamp", Date.now().toString());

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Upload failed");
  }
}

export const RICH_TEXT_EDITOR_EXTENSIONS = [
  Document,
  Text,
  Paragraph,
  UndoRedo,
  Link,
  Heading,
  BulletList,
  OrderedList,
  TaskList,
  Bold,
  Italic,
  Code,
  Strike,
  Underline,
  Blockquote,
  CodeBlock,
  HardBreak,
  ListItem,
  TableKit,
  TaskItem.configure({ nested: true }),
  HorizontalRule,
  Dropcursor,
  Gapcursor,
  TrailingNode,
  ListKeymap,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Image.configure({
    resize: {
      enabled: true,
      directions: ["top", "bottom", "left", "right"],
      minWidth: 50,
      minHeight: 50,
      alwaysPreserveAspectRatio: true,
    },
  }),
  Typography,
  Superscript,
  Subscript,
  Selection,
  Placeholder.configure({
    placeholder: "Start typing...",
  }),
  ImageUploadNode.configure({
    maxSize: 5 * 1024 * 1024,
    maxFiles: 3,
    upload: async (file) =>
      (await uploadToCloudinary(file, "products")).secure_url,
    onError: (error) => console.error("Upload failed:", error),
  }),
];
