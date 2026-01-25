import type { Content, JSONContent } from "@tiptap/core";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";

import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "~/components/ui/button-group";

import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";
import "~/rich-text.css";

import { RICH_TEXT_EDITOR_EXTENSIONS } from "./extentions";
import { BlockquoteButton } from "./ui/blockquote-button";
import { CodeBlockButton } from "./ui/code-block-button";
import { HeadingButton } from "./ui/heading-button";
import { ImageUploadButton } from "./ui/image-upload-button";
import { LinkPopover } from "./ui/link-button";
import { ListDropdownMenu } from "./ui/list-button";
import { MarkButton } from "./ui/mark-button";
import { TextAlignButton } from "./ui/text-align-button";
import { UndoRedoButton } from "./ui/undo-redo-button";

interface RichTextEditorProps {
  defaultValue?: Content;
  onValueChange?: (value: JSONContent | Node) => void;
  className?: string;
}

const RichTextEditor = ({
  defaultValue,
  onValueChange,
  className,
}: RichTextEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "rich-text font-michroma",
      },
    },
    extensions: RICH_TEXT_EDITOR_EXTENSIONS,
    content: defaultValue,
    onUpdate: ({ editor }) => {
      onValueChange?.(editor.getJSON());
    },
  });

  return (
    <EditorContext.Provider value={{ editor }}>
      <div
        className={cn(
          "w-full h-full flex flex-col bg-background border overflow-hidden",
          className
        )}
      >
        <EditorToolbar />

        <div className="flex-1 overflow-y-auto">
          <EditorContent
            editor={editor}
            role="presentation"
            className="prose prose-sm dark:prose-invert max-w-none w-full h-full px-6 sm:px-8 py-6 sm:py-8"
          />
        </div>
      </div>
    </EditorContext.Provider>
  );
};

const EditorToolbar = () => {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "px-3 py-2 bg-background overflow-x-auto flex items-center justify-center",
        isMobile
          ? "w-screen fixed bottom-[env(safe-area-inset-bottom)] left-0 right-0 z-999 border"
          : "w-full",
        "border-b"
      )}
    >
      <div className="w-fit mx-auto">
        <ButtonGroup>
          <ButtonGroup>
            <UndoRedoButton action="undo" />
            <UndoRedoButton action="redo" />
          </ButtonGroup>

          <ButtonGroupSeparator />

          <ButtonGroup>
            <HeadingButton />
            <ListDropdownMenu />
            <BlockquoteButton />
            <CodeBlockButton />
          </ButtonGroup>

          <ButtonGroupSeparator />

          <ButtonGroup>
            <MarkButton markVariant="bold" />
            <MarkButton markVariant="italic" />
            <MarkButton markVariant="strike" />
            <MarkButton markVariant="code" />
            <MarkButton markVariant="underline" />
            <LinkPopover />
          </ButtonGroup>

          <ButtonGroupSeparator />

          <ButtonGroup>
            <MarkButton markVariant="superscript" />
            <MarkButton markVariant="subscript" />
          </ButtonGroup>

          <ButtonGroupSeparator />

          <ButtonGroup>
            <TextAlignButton alignVariant="left" />
            <TextAlignButton alignVariant="center" />
            <TextAlignButton alignVariant="right" />
            <TextAlignButton alignVariant="justify" />
          </ButtonGroup>

          <ButtonGroupSeparator />

          <ButtonGroup>
            <ImageUploadButton />
          </ButtonGroup>
        </ButtonGroup>
      </div>
    </div>
  );
};

export { RichTextEditor };
