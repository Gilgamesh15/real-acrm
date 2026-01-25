import type { JSONContent, Node } from "@tiptap/react";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";

import { cn } from "~/lib/utils";
import "~/rich-text.css";

import { RICH_TEXT_EDITOR_EXTENSIONS } from "./extentions";

const RichText = ({
  content,
  className,
}: {
  content: JSONContent | Node;
  className?: string;
}) => {
  return (
    <div className={cn("rich-text font-michroma", className)}>
      {renderToReactElement({
        content: content,
        extensions: RICH_TEXT_EDITOR_EXTENSIONS,
      })}
    </div>
  );
};

export { RichText };
