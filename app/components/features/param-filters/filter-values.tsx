import { XIcon } from "lucide-react";
import React from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

import { useFilters } from "./filter-provider";

export function FilterValues({
  children,
}: {
  children: (
    filterValues: { label: string; value: string; param: string }[]
  ) => React.ReactNode;
}) {
  const { filterValues } = useFilters();

  return children(filterValues);
}

export function FilterValue({
  label,
  param,
  value,
}: {
  label: string;
  param: string;
  value: string;
}) {
  const { onRemoveFilter } = useFilters();

  const onRemove = () => {
    onRemoveFilter(param, value);
  };

  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1 px-2 py-1 font-secondary"
    >
      {label}
      <Button
        variant="ghost"
        size="icon"
        className="ml-1 h-4 w-4 p-0"
        onClick={onRemove}
      >
        <XIcon />
      </Button>
    </Badge>
  );
}
