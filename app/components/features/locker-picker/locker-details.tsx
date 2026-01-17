import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import type { InpostApiLocker } from "~/lib/types";
import { cn } from "~/lib/utils";

function LockerDetails({
  locker,
  className,
  ...props
}: {
  locker: InpostApiLocker;
} & React.ComponentProps<"div">) {
  const { location_description, operating_hours_extended } = locker;
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <div className="space-y-2 p-2">
        <div className="font-semibold">Opis lokalizacji</div>
        <p className="text-muted-foreground text-sm">{location_description}</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={2}>Godziny otwarcia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-muted-foreground">
          {operating_hours_extended.customer &&
            Object.entries(operating_hours_extended.customer).map(
              ([day, hours]) => (
                <TableRow key={day}>
                  <TableCell className="font-medium">{day}</TableCell>
                  <TableCell className="text-right">
                    {hours.map(({ start, end }) => {
                      const startStr = start.toString();
                      const endStr = end.toString();
                      return `${startStr.slice(0, startStr.length - 2)}:${startStr.slice(startStr.length - 2)} - ${endStr.slice(0, endStr.length - 2)}:${endStr.slice(endStr.length - 2)}`;
                    })}
                  </TableCell>
                </TableRow>
              )
            )}
        </TableBody>
      </Table>
    </div>
  );
}
export { LockerDetails };
