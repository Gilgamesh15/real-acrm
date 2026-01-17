import { useCurrentEditor, useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";

export function useRichTextEditor(): Editor | null {
  const { editor } = useCurrentEditor();

  useEditorState({
    editor,
    selector: (snapshot) => snapshot.transactionNumber,
  });

  return editor;
}
