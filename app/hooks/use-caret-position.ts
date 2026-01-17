import React, { useEffect } from "react";

export function useCaretPosition(
  inputRef: React.RefObject<HTMLInputElement | null>
) {
  const [caretPosition, setCaretPosition] = React.useState({
    x: 0,
    topY: 0,
    bottomY: 0,
  });

  const updateCaretPosition = React.useCallback(() => {
    const element = inputRef.current;
    if (!element) return;

    const caretPos = element.selectionStart;
    if (caretPos === null) return;

    const span = document.createElement("span");
    const style = window.getComputedStyle(element);

    span.style.font = style.font;
    span.style.fontSize = style.fontSize;
    span.style.fontFamily = style.fontFamily;
    span.style.fontWeight = style.fontWeight;
    span.style.letterSpacing = style.letterSpacing;
    span.style.whiteSpace = "pre";
    span.style.position = "absolute";
    span.style.visibility = "hidden";

    const textBeforeCaret = element.value.substring(0, caretPos);
    span.textContent = textBeforeCaret;

    document.body.appendChild(span);
    const textWidth = span.getBoundingClientRect().width;
    document.body.removeChild(span);

    const rect = element.getBoundingClientRect();
    const paddingLeft = parseFloat(style.paddingLeft);
    const scrollLeft = element.scrollLeft;

    const x = rect.left + paddingLeft + textWidth - scrollLeft + window.scrollX;
    const topY = rect.top + window.scrollY;
    const bottomY = rect.top + rect.height + window.scrollY;

    setCaretPosition({ x, topY, bottomY });
  }, [inputRef]);

  useEffect(() => {
    const element = inputRef.current;
    if (!element) return;

    element.addEventListener("selectionchange", updateCaretPosition);
    element.addEventListener("click", updateCaretPosition);
    element.addEventListener("keyup", updateCaretPosition);
    element.addEventListener("focus", updateCaretPosition);
    element.addEventListener("scroll", updateCaretPosition);

    updateCaretPosition();

    return () => {
      element.removeEventListener("selectionchange", updateCaretPosition);
      element.removeEventListener("click", updateCaretPosition);
      element.removeEventListener("keyup", updateCaretPosition);
      element.removeEventListener("focus", updateCaretPosition);
      element.removeEventListener("scroll", updateCaretPosition);
    };
  }, [inputRef, updateCaretPosition]);

  return caretPosition;
}
