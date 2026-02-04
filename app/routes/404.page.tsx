import { Link } from "react-router";

import { buttonVariants } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { SpecialText } from "~/components/ui/special-text";

import { cn } from "~/lib/utils";

export default function NotFoundPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="default">
          <SpecialText>404</SpecialText>
        </EmptyMedia>
        <EmptyTitle className="text-2xl font-bold">
          Strona nie znaleziona
        </EmptyTitle>
        <EmptyDescription className="text-sm text-muted-foreground">
          Strona, której szukasz, nie istnieje.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link
          to="/"
          className={cn(
            buttonVariants({
              variant: "default",
              size: "lg",
            })
          )}
        >
          Wróć do strony głównej
        </Link>
      </EmptyContent>
    </Empty>
  );
}
