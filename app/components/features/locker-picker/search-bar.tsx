import { AlertCircle, MapPinOff, Search, X } from "lucide-react";
import React from "react";

import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import {
  Error,
  ErrorContent,
  ErrorDescription,
  ErrorMedia,
  ErrorTitle,
} from "~/components/ui/error";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "~/components/ui/popover";
import { Skeleton } from "~/components/ui/skeleton";

import { cn } from "~/lib/utils";

function SearchBar({
  onSelect,
  value,
  onValueChange,
  className,
  entries,
  isLoading,
  error,
  ...props
}: {
  onSelect: (entry: { label: string; value: string }) => void;
  value: string;
  onValueChange: (value: string) => void;
  entries: {
    label: string;
    value: string;
  }[];
  isLoading: boolean;
  error: string | undefined;
} & Omit<
  React.ComponentProps<"div">,
  "onSelect" | "value" | "onValueChange" | "entries" | "isLoading" | "error"
>) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const hasSearch = value.trim() !== "";

  React.useEffect(() => {
    if (value.trim() !== "") {
      setIsExpanded(true);
    }
  }, [value]);

  return (
    <Popover open={isExpanded} onOpenChange={setIsExpanded}>
      <PopoverAnchor asChild>
        <div
          className={cn("relative h-9 w-full min-w-xl", className)}
          {...props}
        >
          <Input
            className="absolute inset-0 pl-8 text-sm"
            placeholder="Miasto, ulica lub kod pocztowy"
            value={value}
            onChange={(e) => onValueChange?.(e.target.value)}
          />
          <Search className="absolute left-2.5 top-2.5 text-muted-foreground size-4" />
          {value.trim() !== "" && (
            <Button
              type="button"
              className="absolute top-1/2 -translate-y-1/2 right-1.5 max-w-6 max-h-6 min-h-6 min-w-6 aspect-square"
              variant="secondary"
              onClick={() => onValueChange?.("")}
            >
              <X />
            </Button>
          )}
        </div>
      </PopoverAnchor>

      <PopoverContent
        className="min-w-(--radix-popover-trigger-width) p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="h-full p-1">
          {error ? (
            <div className="flex-1 size-full flex items-center justify-center p-4">
              <Error>
                <ErrorMedia>
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </ErrorMedia>
                <ErrorContent>
                  <ErrorTitle>Wystąpił błąd</ErrorTitle>
                  <ErrorDescription>
                    {error ?? "Wystąpił błąd podczas wyszukiwania"}
                  </ErrorDescription>
                </ErrorContent>
              </Error>
            </div>
          ) : isLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : entries && entries.length === 0 && hasSearch ? (
            <div className="flex-1 size-full flex items-center justify-center p-4">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MapPinOff />
                  </EmptyMedia>
                  <EmptyTitle>Brak wyników</EmptyTitle>
                  <EmptyDescription>
                    Nie znaleziono żadnych lokalizacji pasujących do
                    wyszukiwania
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : entries && entries.length === 0 && !hasSearch ? (
            <div className="flex-1 size-full flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Zacznij wpisywać, aby znaleźć lokalizację
              </p>
            </div>
          ) : entries && entries.length > 0 ? (
            <div className="space-y-1 font-michroma text-sm">
              {entries.map((r) => (
                <div
                  key={r.value}
                  className="p-2 hover:bg-accent cursor-pointer rounded-sm"
                  onClick={() => {
                    onSelect?.({ label: r.label, value: r.value });
                    setIsExpanded(false);
                  }}
                >
                  {r.label}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
export { SearchBar };
