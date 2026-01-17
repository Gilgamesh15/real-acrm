import { User } from "lucide-react";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from "~/components/ui/item";

import type { PersonalDetails } from "~/lib/types";
import { cn } from "~/lib/utils";

interface PersonalDataProps {
  personalData: PersonalDetails;
  className?: string;
}

const PersonalData = ({ personalData, className }: PersonalDataProps) => {
  return (
    <Item size="sm" variant="outline" className={cn("", className)}>
      <ItemHeader>
        <ItemTitle>
          <User className="size-4" />
          Dane klienta
        </ItemTitle>
      </ItemHeader>
      <ItemFooter className="flex-col gap-2 items-stretch">
        <ItemContent className="flex flex-row justify-between gap-4">
          <ItemDescription>Imię i nazwisko</ItemDescription>
          <ItemTitle className="text-right">
            {personalData.firstName} {personalData.lastName}
          </ItemTitle>
        </ItemContent>
        <ItemContent className="flex flex-row justify-between gap-4">
          <ItemDescription>Email</ItemDescription>
          <ItemDescription className="text-right">
            {personalData.email}
          </ItemDescription>
        </ItemContent>
        <ItemContent className="flex flex-row justify-between gap-4">
          <ItemDescription>Telefon</ItemDescription>
          <ItemDescription className="text-right">
            {personalData.phoneNumber}
          </ItemDescription>
        </ItemContent>
      </ItemFooter>
    </Item>
  );
};

export { PersonalData };
