import { createFormHookContexts } from "@tanstack/react-form";
import * as CommandPrimitive from "cmdk";
import { X as RemoveIcon } from "lucide-react";
import React from "react";

import { CommandItem, CommandList } from "~/components/ui/command";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "~/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "~/components/ui/input-group";
import { Popover, PopoverContent } from "~/components/ui/popover";
import { PopoverAnchor } from "~/components/ui/popover";

import { useCaretPosition } from "~/hooks/use-caret-position";
import { cn } from "~/lib/utils";

const { useFieldContext } = createFormHookContexts();

const EDGE_WHITESPACE_PATTERN = /^[^a-zA-Z0-9]*|[^a-zA-Z0-9]*$/g;
const PASTE_SPLIT_PATTERN = /[\n#?=&\t,./-]+/;
// -1 indicates input field is focused (as opposed to a tag at index 0+)
const INPUT_INDEX = -1;

export function TagsField({
  label,
  description,
  max,
  min,
  placeholder,
  suggestions = [],
}: {
  label: string;
  description?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  suggestions?: string[];
}) {
  const field = useFieldContext<string[]>();

  const value = field.state.value;
  const onValueChange = field.handleChange;

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(INPUT_INDEX);
  const [inputValue, setInputValue] = React.useState("");
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);
  const [commandValue, setCommandValue] = React.useState("");

  // Caret positioning for suggestions dropdown
  const { bottomY: caretBottomY, x: caretX } = useCaretPosition(inputRef);

  // Constraints

  const canAdd = React.useMemo(() => {
    if (max === undefined) return true;
    return value.length < max;
  }, [value, max]);

  const canRemove = React.useMemo(() => {
    if (min === undefined) return true;
    return value.length > min;
  }, [value, min]);

  // Filtered suggestions (exclude already added tags)
  const availableSuggestions = React.useMemo(() => {
    return suggestions.filter((suggestion) => !value.includes(suggestion));
  }, [suggestions, value]);

  // State mutations

  const appendTag = React.useCallback(
    (tag: string) => {
      const tagExists = value.includes(tag);

      if (!tagExists && canAdd) {
        onValueChange([...value, tag]);
      }
    },
    [canAdd, onValueChange, value]
  );

  const removeTag = React.useCallback(
    (tag: string) => {
      if (canRemove) {
        onValueChange(value.filter((item) => item !== tag));
      }
    },
    [canRemove, onValueChange, value]
  );

  // Event handlers

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (!canAdd) return;

      e.preventDefault();
      const pastedTags = e.clipboardData
        .getData("text")
        .split(PASTE_SPLIT_PATTERN)
        .map((tag) => tag.replaceAll(EDGE_WHITESPACE_PATTERN, "").trim())
        .filter((tag) => tag.length > 0);

      const newValue = Array.from(new Set([...value, ...pastedTags])).slice(
        0,
        max ?? Infinity
      );

      setInputValue("");
      setSuggestionsOpen(false);
      onValueChange(newValue);
    },
    [max, onValueChange, value, canAdd]
  );
  // Add this state at the top of your component
  const [lastSpaceTime, setLastSpaceTime] = React.useState<number>(0);
  const DOUBLE_SPACE_THRESHOLD = 300; // milliseconds

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const target = e.currentTarget;

      const isAtInput = activeIndex === INPUT_INDEX;
      const isAtInputStart = target.selectionStart === 0;

      const isAtTag = activeIndex >= 0 && activeIndex < value.length;
      const isAtFirstTag = isAtTag && activeIndex === 0;
      const isAtLastTag = isAtTag && activeIndex === value.length - 1;
      const isOnlyTag = value.length === 1;

      const hasTags = value.length > 0;

      switch (e.key) {
        case "ArrowLeft": {
          if (isAtTag && !isAtFirstTag) {
            setSuggestionsOpen(false);
            setActiveIndex((prev) => Math.max(0, prev - 1));
          } else if (isAtInput && isAtInputStart && hasTags) {
            setSuggestionsOpen(false);
            setActiveIndex(value.length - 1);
          }
          break;
        }

        case "ArrowRight": {
          if (isAtTag && !isAtLastTag) {
            setSuggestionsOpen(false);
            setActiveIndex((prev) => Math.min(value.length - 1, prev + 1));
          } else if (isAtTag && isAtLastTag) {
            setActiveIndex(INPUT_INDEX);
          }
          break;
        }

        case "Backspace":
        case "Delete": {
          const currentTagsCnt = value.length;
          const currentActiveIndex = activeIndex;

          let newActiveIndex;
          let tagToRemove;

          if (isAtTag) {
            if (isAtFirstTag) {
              if (isOnlyTag) {
                newActiveIndex = INPUT_INDEX;
                tagToRemove = value[currentActiveIndex];
              } else {
                newActiveIndex = 0;
                tagToRemove = value[currentActiveIndex];
              }
            } else {
              newActiveIndex = Math.max(0, currentActiveIndex - 1);
              tagToRemove = value[currentActiveIndex];
            }
          } else if (isAtInput && isAtInputStart && hasTags) {
            newActiveIndex = INPUT_INDEX;
            tagToRemove = value[currentTagsCnt - 1];
          }

          if (tagToRemove !== undefined && newActiveIndex !== undefined) {
            e.preventDefault();
            removeTag(tagToRemove);
            setActiveIndex(newActiveIndex);
          }
          break;
        }

        case "Enter": {
          if (suggestionsOpen && commandValue) {
            setSuggestionsOpen(false);
            break;
          }

          if (target.value.trim()) {
            e.preventDefault();
            appendTag(target.value.trim());
          }
          break;
        }

        case " ": {
          // Space key
          const currentTime = Date.now();
          const timeSinceLastSpace = currentTime - lastSpaceTime;

          if (timeSinceLastSpace < DOUBLE_SPACE_THRESHOLD) {
            // Double space detected
            if (suggestionsOpen && commandValue) {
              setSuggestionsOpen(false);
              break;
            }

            if (target.value.trim()) {
              e.preventDefault();
              appendTag(target.value.trim());
            }

            // Reset the timer after handling double space
            setLastSpaceTime(0);
          } else {
            // Single space - just update the timer
            setLastSpaceTime(currentTime);
          }
          break;
        }
      }
    },
    [
      value,
      activeIndex,
      suggestionsOpen,
      removeTag,
      commandValue,
      appendTag,
      lastSpaceTime,
    ]
  );

  const handleInputValueChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (activeIndex === INPUT_INDEX) {
        const newValue = e.currentTarget.value;
        setInputValue(newValue);

        // Open suggestions when typing, close when empty
        if (newValue.trim() && availableSuggestions.length > 0) {
          setSuggestionsOpen(true);
        } else {
          setSuggestionsOpen(false);
        }
      }
    },
    [activeIndex, availableSuggestions.length]
  );

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field orientation="responsive" data-invalid={isInvalid}>
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </FieldContent>
      <Popover open={suggestionsOpen} onOpenChange={setSuggestionsOpen}>
        <CommandPrimitive.Command
          value={commandValue}
          onValueChange={setCommandValue}
        >
          <PopoverAnchor
            key={inputValue}
            className="fixed pointer-events-none"
            style={{
              left: caretX,
              top: caretBottomY,
            }}
          />
          <InputGroup className="flex-wrap h-fit">
            {value.map((item, index) => (
              <InputGroupAddon key={item} align="inline-start">
                <InputGroupButton
                  tabIndex={-1}
                  disabled={!canRemove}
                  variant={activeIndex === index ? "default" : "secondary"}
                  onClick={() => removeTag(item)}
                  aria-label={`Remove ${item}`}
                >
                  <span className="text-xs">{item}</span>
                  <RemoveIcon aria-hidden="true" />
                </InputGroupButton>
              </InputGroupAddon>
            ))}
            <CommandPrimitive.CommandInput asChild>
              <InputGroupInput
                ref={inputRef}
                tabIndex={0}
                disabled={!canAdd}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                value={inputValue}
                onChange={handleInputValueChange}
                onClick={() => setActiveIndex(INPUT_INDEX)}
                className={cn(
                  "min-w-24",
                  activeIndex !== INPUT_INDEX && "caret-transparent"
                )}
                placeholder={placeholder}
                aria-label="Add tag"
                aria-invalid={isInvalid || (!canAdd && inputValue.length > 0)}
              />
            </CommandPrimitive.CommandInput>
          </InputGroup>

          <PopoverContent
            side="bottom"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => {
              if (e.target === inputRef.current) {
                e.preventDefault();
              }
            }}
            className="p-0 w-fit min-w-[140px] max-w-sm"
          >
            <CommandList>
              {availableSuggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion}
                  value={suggestion}
                  onSelect={(value) => {
                    setCommandValue(value);
                    setSuggestionsOpen(false);
                    setActiveIndex(INPUT_INDEX);
                    setInputValue("");
                    appendTag(value);
                  }}
                >
                  {suggestion}
                </CommandItem>
              ))}
            </CommandList>
          </PopoverContent>
        </CommandPrimitive.Command>
      </Popover>
    </Field>
  );
}
