import { SearchIcon, XIcon } from "lucide-react";
import React from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "~/components/ui/input-group";

import { useFilters } from "./filter-provider";

function FilterSearchBar() {
  const { filters, setFilters } = useFilters();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleClear = () => {
    setFilters({ ...filters, search: null });
  };

  return (
    <InputGroup className="max-w-xl mx-auto">
      <InputGroupAddon align="inline-start">
        <SearchIcon className="size-4" />
      </InputGroupAddon>
      <InputGroupInput
        value={filters.search}
        placeholder="Szukaj..."
        onChange={handleChange}
        className="pl-9 pr-9"
      />
      {filters.search.trim() !== "" && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={handleClear}>
            <XIcon className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

export { FilterSearchBar };
